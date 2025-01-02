---
title: "Golang Standard Package: context"
description: "An overview and usage of the stardard package context in Go."
date: 2024-12-04
category: "Golang"
tags: ["Golang Standard Package", "Concurrency"]
---

# TL;TR

- How to use Context:
    1. Avoid using empty `Context`, i.e. `Background` and `TODO`, directly
    2. Treat `Context` in **params**, and never put it in truct.
    3. As a param of the function, Context should always be the **first param**.
    4. The `Value` related function of Context should be used for passing **only-needed data**.
    5. Context is **thread-safe** and can be passed around in multiple goroutines.

# 0. Intro

## 0.1 Why context

Context is an important standard package in Golang, as it provides clear and effective management to concurrent operations. Context provides a way to control the lifecycle, cancellation, and propagation of requests across multiple goroutines.

We all know when we start a gorountine, we cannot control but wait for it to terminate itself. Using the method of `chan`+`select` is an elegant way, but with limitations. In a more complex case where multiple goroutines need the termination control or each of these goroutines spawn additional goroutines, managing multiple channels or channels with a complex relationship tree is impossible to to be done in an effective and clean way.

## 0.2 What is context

Context provides us a clean solution to control goroutines by tracing them. It enables the propagation of cancellation signals, deadlines, and values across goroutines. Thus, we can create a hierarchy of goroutines and pass important info down the chain.

### main functions in context

- `AfterFunc`
- `WithCancel`
- `WithDeadline`
- `WithTimeout`
- `WithValue`

Don’t worry if you don’t understand it right now. We would dive into them later.

# 1. Let’s code

### 1.0 example of context’s controlling multiple goroutines

In this example, we start 3 monitor goroutine for periodic monitoring, and each is tracked by the same `Context`. When we use cancel function to notify the canceling, these three goroutines would be terminated.  The spawned sub-`Context`s of the three would also be notified, and thus be cleaned up and be released, which fixes the control issue of goroutine gracefully.

```go
func MultipleWatch() {
	ctx, cancel := context.WithCancel(context.Background())
	go watch(ctx, "[Monitor1]")
	go watch(ctx, "[Monitor2]")
	go watch(ctx, "[Monitor3]")

	time.Sleep(3 * time.Second)
	fmt.Println("It is time to terminate all the monitors")
	cancel()
	time.Sleep(2 * time.Second)
}

func watch(ctx context.Context, name string) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println(name, "stopped monitoring at", time.Now().Format("15:04:05"))
			return
		default:
			fmt.Println(name, "monitoring at", time.Now().Format("15:04:05"))
			time.Sleep(1 * time.Second)
		}
	}
}
```

## 1.1 Context struct

```go
type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
	Value(key interface{}) interface{}
}
```

- **`Deadline`:** returns the time when work done on behalf of this context should be canceled. `ok` is false when no deadline is set.
- **`Done`:** returns a read-only chan, **serving as a signal mechanism for cancellation**. Once `Done` is readable, it means we recieves cancel signal.
- **`Err`:**
    - If `Done` is not yet closed: returns `nil`.
    - If `Done` is closed: returns a non-nil error.
- **`Value`:** returns the value associated with this context for key, or `nil`.

## 1.2 Create a root context

```go
var (
	background = new(emptyCtx)
	todo       = new(emptyCtx)
)

func Background() Context {
	return background
}

func TODO() Context {
	return todo
}
```

Both `context.Background()` or `context.TODO()` to return **a non-nil, empty Context**:

- `Background` is more frequently used as the top-level Context in main function, initialization and tests.
- `TODO` is used when it’s unclear which Context to use or it is not yet available.

Since the two are `emptyCtx`:

1. they cannot be cancelled
2. does not have a deadline set
3. does not carry any values

```go
type emptyCtx struct{}

func (emptyCtx) Deadline() (deadline time.Time, ok bool) {
	return
}

func (emptyCtx) Done() <-chan struct{} {
	return nil
}

func (emptyCtx) Err() error {
	return nil
}

func (emptyCtx) Value(key any) any {
	return nil
}
```

Thus, we can customize the `Context` behaviors by creating a context hierarchy through the functions mentioned above.

## 1.3 Inherit

With the root Context, we can generate more sub-context using the functions below, which all take a `parent` context and create a **child** context based on the **parent** context:

```go
func WithCancel(parent Context) (ctx Context, cancel CancelFunc)
func WithDeadline(parent Context, deadline time.Time) (Context, CancelFunc)
func WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)
func WithValue(parent Context, key, val interface{}) Context
```

### 1) `WithCancel`

The returned context's Done channel is closed when:

1. the returned cancel function is called or 
2. when the parent context's Done channel is closed

whichever happens first.

```go
func WithCancelExample() {
	increment := func(ctx context.Context) <-chan int {
		dst := make(chan int)
		n := 0
		go func() {
			for {
				select {
				case <-ctx.Done():
					return
				case dst <- n:
					n++
				}
			}
		}()
		return dst
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	for n := range increment(ctx) {
		fmt.Println(n)
		if n == 5 {
			break
		}
	}
}
```

### 1-2) `WithCancelCause`

Behave like `WithCancel`, but returns a `CancelCauseFunc` instead of a `CancelFunc`. Calling cancel with a non-nil error recorrds that error in `ctx`, which can then be retrieved using `Cause(ctx)`.

```go
ctx, cancel := context.WithCancelCause(parent)
cancel(myError)
ctx.Err() // returns context.Canceled
context.Cause(ctx) // returns myError
```

### 2) `WithDeadline`

The returned [Context.Done] channel is closed when the deadline expires, when the returned cancel function is called, or when the parent context's Done channel is closed, whichever happens first.

```go
func watch(ctx context.Context, name string) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println(name, "stopped monitoring at", time.Now().Format("15:04:05"))
			return
		default:
			fmt.Println(name, "monitoring at", time.Now().Format("15:04:05"))
			time.Sleep(1 * time.Second)
		}
	}
}

func WithDeadlineExample() {
    ddl := time.Now().Add(3 * time.Second)
    fmt.Println("Monitoring will be stopped at", ddl.Format("15:04:05"))
    ctx, cancel := context.WithDeadline(context.Background(), ddl)
    defer cancel()
    go watch(ctx, "Monitor1")
    time.Sleep(5 * time.Second)
}

// outputs:
// Monitoring will be stopped at 19:31:20
// Monitor1 monitoring at 19:31:17
// Monitor1 monitoring at 19:31:18
// Monitor1 monitoring at 19:31:19
// Monitor1 monitoring stopped at 19:31:20
```

### 3) `WithTimeout`

Similar to the example above:

```go
func WithTimeoutExample() {
    monitor := func(ctx context.Context, name string) {
        for {
            select {
                case <-ctx.Done():
                    fmt.Println(name, "monitoring stopped at", time.Now().Format("15:04:05"))
                    return
                default:
                    fmt.Println(name, "monitoring at", time.Now().Format("15:04:05"))
                    time.Sleep(1 * time.Second)
            }
        }
    }
    timeout := 3 * time.Second
    fmt.Println("Monitoring will be stopped after", timeout)
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()
    go monitor(ctx, "Monitor1")
    time.Sleep(5 * time.Second)
}

// outputs:
// Monitoring will be stopped after 3s
// Monitor1 monitoring at 19:31:22
// Monitor1 monitoring at 19:31:23
// Monitor1 monitoring at 19:31:24
// Monitor1 monitoring stopped at 19:31:25
```

### 4) `WithValue`

Use context Values only for request-scoped data, not for passing optional params.

- **Attention:** the provided key must be:
    1. comparable
    2. should not be of type string or any other built-in type 
    
    To **avoid collisions** between packages using context.
    

```go
func monitor(ctx context.Context, mName MonitorName) {
	name := ctx.Value(mName)
	for {
		select {
		case <-ctx.Done():
			fmt.Println(name, "stopped monitoring at", time.Now().Format("15:04:05"))
			return
		default:
			fmt.Println(name, "monitoring at", time.Now().Format("15:04:05"))
			time.Sleep(1 * time.Second)
		}
	}
}

type MonitorName string

func WithValueExample() {
	monitorName1 := MonitorName("MonitorKey1")
	ctx, cancel := context.WithCancel(context.Background())
	ctx = context.WithValue(ctx, monitorName1, "[Monitor1]")
	go monitor(ctx, monitorName1)
	time.Sleep(3 * time.Second)
	cancel()
}

// outputs:
// [Monitor1] monitoring at 19:46:10
// [Monitor1] monitoring at 19:46:11
// [Monitor1] monitoring at 19:46:12
```

### 5) Combined example

There is a 10s timeout for the monitor to be cancelled. And if we press ctrl+c on the keyboard within 10s, the mintor would also get cancelled.

```go
func MixedExample() {
	timeout := 10 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cancelChan := make(chan os.Signal, 1)
	signal.Notify(cancelChan, os.Interrupt, syscall.SIGINT)

	go watch(ctx, "Monitor1")
	for {
		select {
		case <-cancelChan:
			cancel()
			fmt.Println("Cancel signal received and stop monitoring")
			return
		default:
			time.Sleep(100 * time.Millisecond)
		}
	}
}

// outputs:
// Monitor1 monitoring at 19:59:05
// Monitor1 monitoring at 19:59:06
// Monitor1 monitoring at 19:59:07
// Monitor1 monitoring at 19:59:08
// ^CCancel signal received and stop monitoring
```

### 6) `AfterFunc`

- **Syntax:** `func AfterFunc(ctx [Context](https://pkg.go.dev/context#Context), f func()) (stop func() bool)`
- **Purpose:** allows you to schedule a function to run after a context is done (either canceled or timed out)
- **Example:**
    
    ```go
    func main() {
    	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    	defer cancel()
    
    	// Simulate a long-running task
    	go func() {
    		time.Sleep(10 * time.Second)
    		fmt.Println("Task completed")
    	}()
    
    	// Schedule a cleanup function to run after the context is done
    	context.AfterFunc(ctx, func() {
    		fmt.Println("Cleaning up resources")
    	})
    
    	<-ctx.Done()
    	fmt.Println("Context done")
    }
    ```

To see the full example of code, you can visit: [goContext](https://github.com/jidalii/go-playground/blob/main/goContext/main.go)

# References

- https://pkg.go.dev/context
- https://medium.com/@jamal.kaksouri/the-complete-guide-to-context-in-golang-efficient-concurrency-management-43d722f6eaea
- https://murphypei.github.io/blog/2021/06/go-context
