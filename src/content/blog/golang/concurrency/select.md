---
title: "Concurrency in Go (3): select"
description: "This blog explores Go select statement - a super important building block in Go concurrency."
date: 2024-12-25
category: "Golang"
tags: ["Concurrency", "Goroutine"]
---

## Intro

While channels are the glue that binds goroutines together, the `select` statement is the glue that binds channels together. The select statement is undoubtedly one of the most critical things in a Go program with concurrency. 

The `select` statement help safely bring channels together with concepts like cancellations, timeout, waiting, and default values.

## Concepts

The syntax of `select` block is a bit like `switch` block. However, unlike `switch` blocks where `case` statements in a `select` block are tested sequentially, in `select` block, the execution won’t fall through if none of the criteria are met. That is saying if none of the channels are ready, the **entire select statement blocks** until one of the channels is ready and the corresponding statements will execute.

```go
func simpleSelectExample() {
	ch := make(chan any)

	start := time.Now()
  go func() {
      time.Sleep(3 * time.Second)
      // close channel after 3 seconds
      close(ch)
  }()

	fmt.Printf("Blocking...\n")
	select {
	//blocked until goroutine signals close
	case <-ch:
		fmt.Printf("Unblocked %.2v later!\n", time.Since(start))
	}
}
```

```bash
# outputs:
Blocking...
Unblocked 3. later!
```

## Delve deeper

### TR;TR

1. The Go runtime performs a pseudorandom uniform select over the set of case statements, meaning each case statement has an equal chance of being selected.
2. Add timeout in the `case` clause to prevent forever blocking.
3. If we want to process somthing when no channels are ready, have the `default` clause and put the `select` block in a for loop ***(for-select loop***).

### 1) what if multiple channels have something to read?

Each clause of the `select` statement has the equal chance to be selected. Here is an example:

```go
func selectEqualChanceExample() {
	c1 := make(chan interface{})
	close(c1)
	c2 := make(chan interface{})
	close(c2)

	var c1Count, c2Count int
	for i := 1000; i >= 0; i-- {
		select {
		case <-c1:
			c1Count++
		case <-c2:
			c2Count++
		}
	}
	fmt.Printf("c1Count: %d\nc2Count: %d\n", c1Count, c2Count)
}
```

```bash
# outputs:
c1Count: 508
c2Count: 493
```

As can be seen from the result, the two clauses roughly have the chance to be executed.

### 2) what if all channels would never be ready?

Use a timeout clause in `select` statement. Here is an example:

```go
func selectTimeoutExample() {
	now := time.Now()
	ch1 := make(chan any)

	select {
	case <-ch1:
	case <-time.After(2 * time.Second):
		fmt.Printf("Timed out after %.2v seconds\n", time.Since(now))
	}
}
```

```bash
# outputs:
Timed out after 2. seconds
```

### 3) what if we want to do something when no channel is ready?

Use default clauses if you want to do something when all channels you are selecting against re blocking. Here is an example:

```go
func selectDefaultExample() {
    ch := make(chan any)
    counter := 0

    go func() {
        time.Sleep(4 * time.Second)
        close(ch)
    }()

    loop:
    for {
        select {
        case <-ch:
            break loop
        default:
        }
        counter++
        time.Sleep(1 * time.Second)
    }
    fmt.Println("counter:", counter)
}
```

```bash
# outputs:
counter: 4
```

To see the full example of code, you can visit: [goSelect](https://github.com/jidalii/go-playground/blob/main/goSelect/main.go).
