---
title: "Concurrency in Go (1): sync"
description: "An overview and usage of sync package in Go."
date: 2024-12-19
category: "Golang"
tags: ["Golang Standard Package", "Concurrency"]
---
The `sync` library provides some basic synchronization primitives. The types in the `sync` library are mostly intended for low-level routine. Higher-level synchronization is better done via channels and communication.

# 1. `sync.Mutex` & `sync.RWMutex`

## What is mutex

A Mutex is a mutual exclusion lock. It is used to protect critical area and shared resource in the scenario of multi-threads/ multi-routines.

## Why mutex

Why do we need a mutex? Imagine you and your friends are sitting at a table with just one slice of pizza left in the box. Everyone is in a hurry and wants to grab the last slice, but without coordination, it could lead to chaos as you all reach for it simultaneously.

A mutex can solve this problem. Think of the mutex as a unique lock for the pizza box. Only the person holding the mutex can open the box and take the slice, while everyone else must wait. Once the slice is taken and the mutex is released, the next person can acquire the mutex and take their turn. This ensures order and prevents conflicts.

You can check out the pizza-grabbing example code under `EatPizzaMutex` and `EatPizzaRace` methods in this repository: [Pizza Example](https://github.com/jidalii/go-playground/blob/main/goSync/main.go#L14).

## `sync.Mutex`

### **method**

- **`func (*m* *Mutex) Lock()`:** Lock `m`. If the lock is already in use, the calling goroutine **blocks** until the `m` is available.
- **`func (*m* *Mutex) UnLock()`:** Unlock `m`. It is a run-time error if `m` is not locked on entry to `Unlock`.
- **`func (*m* *Mutex) TryLock() bool`:** Try to lock `m` and reports whether it succeeded *(rare to use)*.

### example

In the example below, the mutex ensures only one operation of deposit or withdrawal can be modify the balance at a time, preventing conflicts.

```go
func BankMutex() {
	fmt.Println("********** BankMutex **********")
	balance := 1000
	mutex := sync.Mutex{}
	ch := make(chan int, 3)
	defer close(ch)

	fmt.Printf("Initial balance: %d\n", balance)

	deposit := func(amount int, mutex *sync.Mutex, ch chan int) {
		fmt.Printf("Depositing %d\n", amount)
		mutex.Lock()
		balance += amount
		mutex.Unlock()
		ch <- amount
	}

	withdraw := func(amount int, mutex *sync.Mutex, ch chan int) {
		fmt.Printf("Withdrawing %d\n", amount)
		mutex.Lock()
		balance -= amount
		mutex.Unlock()
		ch <- -amount
	}

	// start 3 goroutines
	go deposit(500, &mutex, ch)
	go withdraw(200, &mutex, ch)
	go withdraw(600, &mutex, ch)

	// read txn amount of each operations
	for i := 0; i < 3; i++ {
		fmt.Printf("Transaction amount: %d\n", <-ch)
	}
	time.Sleep(2 * time.Second)  // sleep to ensure all goroutines are done.

	fmt.Printf("Final balance: %d\n", balance)
}
```

- output:
    
    ```bash
    ********** BankMutex **********
    Initial balance: 1000
    Withdrawing 600
    Transaction amount: -600
    Depositing 500
    Transaction amount: 500
    Withdrawing 200
    Transaction amount: -200
    Final balance: 700
    ```
    

## `sync.RWMutex`

### why `RWMutex`

You might wonder why we need `RWMutex` when we already have mutex. With a regular mutex, multiple readers must wait their turn to access data one by one, which is inefficient since concurrent reading doesn't cause race conditions. `RWMutex` addresses this by allowing either multiple simultaneous reads or a single write at a time.

If you are interested, you may follow this link to see the benchmark test between `Mutex` and `RWMutex` of the scenario above: [Benchmark Example](https://github.com/jidalii/go-playground/blob/main/goSync/main.go#L165).

### define

A `RWMutex` is a reader/writer mutual exclusion lock. The lock can be held by **an arbitrary number of readers** or **a single writer**.

Simply put:

- When a shared resource is locked by write-lock, anyone who tries to acquire write-lock or read-lock would be blocked until released.
- When a shared resource is locked by read-lock,  anyone who tries to acquire read-lock would not be blocked, while those trying to acquire write-lock would.

In general, the write-lock has a high priority than read-lock. So RWMutex is very useful for the scenario about writing less but read more.

### methods

- **`func (rw *RWMutex) Lock()`:** Lock rw ***for writing***.
- **`func (rw *RWMutex) RLock()`:** Lock rw for reading.
- **`func (rw ***RWMutex) UnLock()`:**  Unlock rw for writing.
- **`func (rw ***RWMutex) RUnLock()`:**  Unlock a single `Rlock` call → not affect other simultaneous readers.
- **`func (rw ***RWMutex) TryLock() bool`**
- **`func (rw ***RWMutex) TryRLock() bool`**

### example

The following is a simple example of `RWMutex`.

```go
func SimpleRWMutex() {
	balance := 1000
	rwMutex := sync.RWMutex{}

	write := func(amount int, rwMutex *sync.RWMutex) {
		rwMutex.Lock()
		defer rwMutex.Unlock()
		balance += amount
	}
	read := func(rwMutex *sync.RWMutex) int {
		rwMutex.RLock()
		defer rwMutex.RUnlock()
		return balance
	}

	go write(100, &rwMutex)
	go read(&rwMutex)
	go write(200, &rwMutex)
	go read(&rwMutex)

	time.Sleep(2 * time.Second)
}
```

# 2. `sync.WaitGroup`

### intro

In the previous examples, we use `time.Sleep` to “ensure” all the goroutines we fire terminate. However, this method is very time-consuming and inefficient. What’s worse, in a more complex scenario, like calling APIs, we cannot garauntee how much time it would take for all goroutines to get terminated. Some important operations may end before being settled.

We can tackle the issue above using `WaitGroup`.

### concepts

- **Define:** A WaitGroup waits for a collection of goroutines to finish.
- **How it works:**
    1. The main goroutine, i.e. your main function, calls `WaitGroup.Add` to set the number of goroutines to wait for.
    2. Each goroutines runs and calls `WaitGroup.Done` when finished.
    3. At the same time, `WaitGroup.Wait` can be used to block until all goroutines have finished.

<aside>
🔴

**Attention:** A `WaitGroup` **must not** be copied after first use.

</aside>

### methods

Let’s dive into these methods:

- `func (wg *WaitGroup) Add(delta int)`: Add `delta` to the `WaitGroup` counter, where `delta` typically represnets # of goroutines.
    - If counter == 0, all goroutines blocked on `WaitGroup`.Wait are released.
    - If counter < 0, Add panics.
- `func (wg *WaitGroup) Done()`: Decrements the `WaitGroup` counter by 1.
- `func (wg *WaitGroup) Wait()` : Wait blocks until the `WaitGroup` counter is 0.

### example

The following example find prime number in range of `start` and `end`:

- We can create a `WaitGroup` by either:
    - `wg := new(sync.WaitGroup)`
    - `var wg sync.WaitGroup`

```go
func FindPrimeNumbersInRange(start, end int) {
	// Create a WaitGroup
	// wg := new(sync.WaitGroup)
	var wg sync.WaitGroup
	
	// Add the number of goroutines to the WaitGroup
	wg.Add(end - start + 1)

	// Create a goroutine for each number
	for i := start; i <= end; i++ {
		go IsPrime(i, &wg)
	}
	
	wg.Wait()  // <- Block here until all goroutines to finish
}

func IsPrime(n int, wg *sync.WaitGroup) bool {
	// Defer Done to notify the WaitGroup when the task done
	defer wg.Done()
	
	if n < 2 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	fmt.Println("Prime number:", n)
	return true
}
```

### attention when using `Add`

1. **Positive vs. Negative Delta:** 
    - **Positive Delta:** Increment the counter to indicate new tasks to wait for.
    - **Negative Delta:** Decrement the counter to indicate completed tasks.
        
        ```go
        // code snippet from waitgroup.go
        // *Done is equivalent to Add(-1)*
        func (wg *WaitGroup) Done() {
        	wg.Add(-1)
        }
        ```
        
2. **Calling `Add` Before Starting a Goroutine:** call `Add` with a positive delta **must occur before  a Wait or creating a goroutines**.
3. **Rules for reuage:** Ensure that all `Add` calls for the new set of tasks happen **after** the previous `Wait` call has completed → avoid overlapping usage of the counter.
4. A `WaitGroup` **must not** be copied after first use → use the **pointer of `WaitGroup`** when passing it as a parameter to functions or methods.

---

To see the full example of code, you can visit: [goContext](https://github.com/jidalii/go-playground/blob/main/goSync/main.go)

# References

- https://pkg.go.dev/sync
- https://medium.com/@asgrr/golang-sync-4787b18fee41
- [https://medium.com/@yuanji.zhai/go-concurrency-sync-cond-sync-mutex-rwmutex-5bb8bda251cc#:~:text=In general%2C the write-lock,writing less but read more](https://medium.com/@yuanji.zhai/go-concurrency-sync-cond-sync-mutex-rwmutex-5bb8bda251cc#:~:text=In%20general%2C%20the%20write%2Dlock,writing%20less%20but%20read%20more).