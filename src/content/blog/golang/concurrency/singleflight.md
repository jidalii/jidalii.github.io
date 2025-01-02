---
title: "Concurrency in Go (4): singleflight"
description: "This blog explores the singleflight library which optimizes concurrency, prevents cache miss storms, and improve server performance."
date: 2025-01-01
category: "Golang"
tags: ["Concurrency", "Cache Optimization", "singleflight"]
---

# Intro

When building a backend server with a database, adding a caching layer, such as Redis, is a common practice to prevent excessive database queries. However, in the case of cache miss storm where numerous requests simultaneously query the same expired key, the resulting cache miss can overwhelm the database with a surge of queries, potentially leading to performance degradation or timeouts.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/0ae117bc-b356-44c8-ada3-e1ff2a156acc/022ce87c-80ae-47e5-9f64-b52e9a12df06/image.png)

To address this issue, `singleflight` package can be used to **combine multiple identical requests into one** within a short period, and thus, the database load can be reduced from N requests to just 1, improving the system’s robustness. It allows ***only one “in-flight” (on-going) operation*** for the same “key” at any given time.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/0ae117bc-b356-44c8-ada3-e1ff2a156acc/f5ccf5b2-19c6-4e4c-987b-8d63f79be044/image.png)

# How to use

## 1. `Do`

### concepts

- **Syntax:**
    
    ```go
    func (*g* *Group) Do(*key* string, *fn* func() (interface{}, error)) 
    		 (*v* interface{}, *err* error, *shared* bool)
    ```
    
- **Behavior:** execute and return the results of `fn`, making sure only one execution is in-flight for a given key at a time. If a duplicate comes in, the duplicate caller waits for the first to complete and receives the same results.
- **Returns:**
    - `v interface{}, err error`: returned values of `fn`
    - `shared bool`: indicates whether v was given to multiple callers

### example

The example below simulates a simple case where 5 goroutines try to fetch the same data, spaced 40 ms apart. Thanks to `singleflight.group`, we ensure only the first goroutine runs fetchData(), reducing the overhead.

```go
var callCount atomic.Int32
var wg sync.WaitGroup

// Simulate a function that fetches data from a database
func fetchData() (interface{}, error) {
	callCount.Add(1)
	time.Sleep(100 * time.Millisecond)
	return rand.Intn(100), nil
}

// Wrap the fetchData function with singleflight
func fetchDataWrapper(g *singleflight.Group, id int) error {
	defer wg.Done()

	time.Sleep(time.Duration(id) * 40 * time.Millisecond)
	// Assign a unique key to track these requests
	v, err, shared := g.Do("key-fetch-data", fetchData)
	if err != nil {
		return err
	}

	fmt.Printf("Goroutine %d: result: %v, shared: %v\n", id, v, shared)
	return nil
}

func main() {
	var g singleflight.Group

	// 5 goroutines to fetch the same data
	const numGoroutines = 5
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go fetchDataWrapper(&g, i)
	}

	wg.Wait()
	fmt.Printf("Function was called %d times\n", callCount.Load())
}
```

The diagram below shows the `singleflight` in action. 

From time `0ms` to time `100ms`, while `G0` is fetching the data, `G1` and `G2` ask for the same key. So they wait for the result rather than starting a new call. Once `G0` finishes its call, any waiting goroutines get the same result.

Therefore, even though 5 goroutines are fetching data, `fetchData` only ran twice.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/0ae117bc-b356-44c8-ada3-e1ff2a156acc/640bf620-ec4e-4cb8-802c-62b357541880/image.png)

Here, the results prove the idea above.

Meanwhile, you may wonder whether `shared` for `G0` is `true`, as it is the first goroutine. The reason is that shared in g.Do tells whether the result was shared among multiple callers, meaning whether the result is used by more than one caller. It tells **the result is reused across multiple goroutines**.

```bash
❯ go run main.go
Goroutine 0: result: 55, shared: true
Goroutine 1: result: 55, shared: true
Goroutine 2: result: 55, shared: true
Goroutine 3: result: 24, shared: true
Goroutine 4: result: 24, shared: true
Function was called 2 times
```

## 2. `DoChan`

### concepts

- **Syntax:**
    
    ```go
    func (*g* *Group) DoChan(*key* string, *fn* func() (interface{}, error)) 
    		 <-chan Result
    ```
    
- **Behavior:** similar to `Do`, it returns a channel that will receive the results when they are ready, instead of blocking. The returned channel would not be closed.
- **Use case:** useful if prefer handling the result asynchronously or if you’re selecting over multiple channels.

### example

In the real scenario, fetching the data from the database could take a unexpected long time. Using `DoChan` allows us to have a timeout control to help to prevent unexpectedly long blocking.

```go
func goChanExample() {
    fetchData := func() (interface{}, error) {
        // infinite blocking
        select{}
        return rand.Intn(100), nil
    }
    
    wg := sync.WaitGroup{}
    g := singleflight.Group{}
    
    ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
    defer cancel()

    ch := g.DoChan("key-fetch-data", fetchData)
		select {
		case res := <-ch:
				if res.Err != nil {
		        fmt.Printf("error: %v\n", res.Err)
						return
				}
				fmt.Printf("result: %v, shared: %v\n", res.Val, res.Shared)
		case <-ctx.Done():
        fmt.Println("timeout")
				return
		}

    wg.Wait()
}

// output:
// timeout
```

## 3. `Forget`

### concepts

- **Syntax:**
    
    ```go
    func (g *Group) Forget(key string)
    ```
    
- **Behavior:** tell the singleflight to forget about a key. Future calls to `Do` for this key will call the function rather than waiting for an earlier call to complete.

### example

The `Group.Forget` method allows you to explicitly remove a key from the group’s internal mapping, so subsequent calls for the same key will not wait for the previous function to return.

```go
func forgetExample() {
	// Function to simulate a long-running process
	fetchData := func(key string) (interface{}, error) {
		fmt.Printf("Fetching data for key: %s\n", key)
		time.Sleep(2 * time.Second) // Simulate a delay
		return fmt.Sprintf("Result for %s", key), nil
	}
	
	var g singleflight.Group
	
	var wg sync.WaitGroup
  wg.Add(3)

	// Goroutine 1: Call fetchData with key "key1"
	go func() {
		result, err, shared := g.Do("key1", func() (interface{}, error) {
			return fetchData("key1")
		})
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			fmt.Printf("G1 received: %v (shared: %v)\n", result, shared)
		}
        wg.Done()
	}()

	// Goroutine 2: Forget the key before the result is available
	go func() {
		time.Sleep(1 * time.Second) // Wait a bit to simulate concurrency
		g.Forget("key1")
		fmt.Println("G2 called Forget for key1")
        wg.Done()
	}()

	// Goroutine 3: Call fetchData with key "key1" after Forget
	go func() {
		time.Sleep(1 * time.Second) // Wait to ensure Forget is called first
		result, err, shared := g.Do("key1", func() (interface{}, error) {
			return fetchData("key1")
		})
		if err != nil {
			fmt.Println("Error:", err)
		} else {
			fmt.Printf("G3 received: %v (shared: %v)\n", result, shared)
		}
        wg.Done()
	}()

	wg.Wait()
}
```

```bash
❯ go run main.go
Fetching data for key: key1 # fetched by G1
G2 called Forget for key1
Fetching data for key: key1 # fetched by G3 
G1 received: Result for key1 (shared: false)
G3 received: Result for key1 (shared: false)
```

## Example of cache miss

- The following is the benchmark test results of diagrams in the Intro section. You may view and run the code by cloning the repo:

```bash
BenchmarkQueryUserSingleflight_1000-12 
DB query was called 1 times
...
1000000000               0.1379 ns/op

BenchmarkQueryUser_1000-12
DB query was called 1000 times
...
1000000000               0.1397 ns/op

BenchmarkQueryUserSingleflight_10000-12 
DB query was called 2 times
...
1000000000               0.5933 ns/op

BenchmarkQueryUser_10000-12
DB query was called 10000 times
...
1000000000               0.6913 ns/op
```

# How it works

Let’s first take a look at the structs in singleflight.

## 1. `Group` & `call`

```go
type Group struct {
	mu sync.Mutex       // protects the map m
	m  map[string]*call // maps keys to calls; lazily initialized
}

type call struct {
	wg    sync.WaitGroup   // waits for the function execution
	val   interface{}      // result of the function call
	err   error            // error from the function call
	dups  int              // number of duplicate callers
	chans []chan<- Result  // channels to receive the result
}
```

- **Group mutex `mu`:** Project the entire map of keys, not one lock per key → ensure updating keys is thread-safe.
- **WaitGroup `wg`:** Used to wait for the first goroutine associated with a specific key to finish its work.

<aside>
🟡

When calling `group.Do()`, the entire map of calls `m` is locked. It could lead to bad performance in complex cases. A better approach is to shard or distribute the keys. Instead of doing “singleflight”, we do “multi-flight”

</aside>

## 2. `g.Do()`

Source code:

```go
func (g *Group) Do(key string, fn func() (interface{}, error)) (v interface{}, err error, shared bool) {
	// lock the call map
	g.mu.Lock()
	
	// if the map is not initialized, initialize it
	if g.m == nil {
		g.m = make(map[string]*call)
	}
	
	// if the call is found in the map
	if c, ok := g.m[key]; ok {
		// increment a counter to track dup requests
		c.dups++
		// releases the lock
		g.mu.Unlock()
		// wait for the original task to complete by calling
		c.wg.Wait()

		if e, ok := c.err.(*panicError); ok {
			panic(e)
		} else if c.err == errGoexit {
			runtime.Goexit()
		}
		return c.val, c.err, true
	}
	// if no other goroutine is doing the request
	// create a new call object
	c := new(call)
	c.wg.Add(1)
	// add it to the call map
	g.m[key] = c
	g.mu.Unlock()

	// execute the function
	g.doCall(c, key, fn)
	return c.val, c.err, c.dups > 0
}
```

## 2-1. `runtime.Goexit()`

### concepts

`runtime.Goexit()` is used to **stop the execution of a goroutine**. When a goroutine calls `Goexit()`, it stops, and **any deferred functions are still run** in Last-In-First-Out (LIFO) order, just like normal.

Be careful as it doesn’t trigger a panic. And **only the goroutine that calls `Goexit()` gets terminated** and all the other goroutines keep running just fine.

### experiments

In this code snippet, `Goexit()` terminates the main goroutine. But if there are other goroutines still running, the program keeps going because the Go runtime stays alive as long as at least one goroutine is active.

```go
func firstTry() {
    go func() {
        fmt.Println("sub goroutine called")
    }()

    runtime.Goexit()
    fmt.Println("main goroutine called")
}
```

```bash
❯ go run goexit.go
sub goroutine called
fatal error: no goroutines (main called runtime.Goexit) - deadlock!
exit status 2
```

## 2-2. `doCall()`

`doCall()` handles the single call for a key. It uses two defers to panic from `runtime.Goexit`.

When `runtime.Goexit()` is called, the entire goroutine is terminated, like `panic()`. However, if a `panic()` is recovered, only the chain of functions between the `panic()` and the `recover()` is terminated, not the entire goroutine.

```go
func (g *Group) doCall(c *call, key string, fn func() (interface{}, error)) {
	normalReturn := false
	recovered := false

	// use double-defer to distinguish panic from runtime.Goexit,
	defer func() {
		// the given function invoked runtime.Goexit
		if !normalReturn && !recovered {
			c.err = errGoexit
		}
		... // handle each case
	}()

	func() {
		defer func() {
			if !normalReturn {
				if r := recover(); r != nil {
					c.err = newPanicError(r)
				}
			}
		}()

		c.val, c.err = fn()
		normalReturn = true
	}()

	if !normalReturn {
		recovered = true
	}
}
```

# Summary

1. Use `Do()` for the sync case, while use `DoChan()` for the async case.
2. If one goroutine is blocked for fetching Resource A, any other goroutines fetching Resource A would also be blocked.
3. Use DoChan for a more customized control, like timeout.
4. Once the calling goroutine receives the value or the error, all the other waiting goroutines would also receive the value or the error.
5. The `Group.Forget` method allows you to explicitly remove a key from the group’s internal mapping, so subsequent calls for the same key will not wait for the previous function to return.

# References

- https://pkg.go.dev/golang.org/x/sync@v0.10.0/singleflight
- https://victoriametrics.com/blog/go-singleflight/