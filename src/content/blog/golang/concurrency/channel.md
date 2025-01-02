---
title: "Concurrency in Go (2): channel"
description: "This blog explores Go channels - a fundamental concurrency primitive that enables safe communication between goroutines, covering different channel types with examples."
date: 2024-12-24
category: "Golang"
tags: ["Concurrency", "Goroutine"]
---

# Intro

Channels are a core component of Go’s concurrency model. It allows goroutines to communicate safely and synchronize their execution. Channel is super useful in any of your programs thanks to its superpower.

You may imagine a **channel in Go** as a ***canal***, where cargo ships travel from one side of the canal to the other, delivering goods in a **orderly** manner. Bu for a Go channel, it is **a stream of information** that flows between goroutines. We **send data along the channel** like loading cargo onto ships, and **read the data downstream** like unloading cargo at the destination.

# Get started

## Channel creation

Creating Go Channels is easy. Here would create a channel `dataStream` which allows **any data *(`interface{}` means `any` in Golang)*** to be read or written. Any we also create a channel `intStream` which allows only `int` data to be read or written.

```go
dataStream := make(chan interface{})
intStream := make(chan int)
```

## Channel read & write

### **read**:

syntax: `val, ok := <- ch`

- `val`: value read from the channel.
- `ok`: a boolean
    - `ok` is `true` when:
        1. The channel is **open** and a value is **successfully received** from the channel.
        2. The channel is **closed** but there are **buffered values** in the channel
    - `ok` is `false` when:
        1. The channel is **closed** and there are **no more values left** to receive.

### **write:**

syntax: `ch <- val`

### example:

```go
func chanReadWriteExample() {
    intCh := make(chan int)
    go func() {
        intCh <- 1  // write to intCh
        close(intCh)
    }()
    for _ = range 2 {
			val, ok := <-intCh  // read from intCh
			fmt.Printf("(%v): %d\n", ok, val)
		}
}

// output:
// (true): 1
// (false): 0
```

## Chanel closing

Closing a channel is also one of the ways you can signal multiple goroutines simultaneously.

A closed channel **can** still be **received** from, but it will **always return zero values** after the last value has been received.

- Exmple:
    
    ```go
    func closeChannelAsSignal() {
    	startRace := make(chan interface{})
    	wg := sync.WaitGroup{}
    
    	for i := 0; i < 5; i++ {
    		wg.Add(1)
    		go func(id int) {
    			defer wg.Done()
    			<-startRace // Wait for start signal
    			fmt.Printf("Runner %d started (%s)\n", id, time.Now().Format("15:04:05.000"))
    		}(i)
    	}
    
    	fmt.Printf("Preparing the race... (%s)\n", time.Now().Format("15:04:05.000"))
    	time.Sleep(2 * time.Second)
    	fmt.Printf("...GO! (%s)\n", time.Now().Format("15:04:05.000"))
    
    	close(startRace) // Signal all runners to start
    	wg.Wait()        // Wait for all runners to finish
    }
    ```
    
    ```bash
    # outputs:
    Preparing the race... (16:47:49.317)
    ...GO! (16:47:51.317)
    Runner 3 started (16:47:51.318)
    Runner 4 started (16:47:51.318)
    Runner 2 started (16:47:51.318)
    Runner 1 started (16:47:51.318)
    Runner 0 started (16:47:51.318)
    ```
    

# Types of channels

## 1. Bidirection & unidirection

### 1) bidirectional channels

The channels we defined above are all bidirectional channels where we can read and write to the channel.

Bidirectional channel:

```go
bidirectionalCh := make(chan interface{})
```

### 2) unidirectional channels

The unidirectional channel means you can either write to or read from the channel.

- **Write-only channel:**
    
    ```go
    writeOnlyCh := make(chan<- interface{})
    ```
    
- **Read-only channel:**
    
    ```go
    readOnlyCh := make(<-chan interface{})
    ```
    

Initializing unidirectional channels is relatively uncommon in real-world scenarios. They are more often used as **function parameters or return types**. You may ask but how? Go will implicitly convert bidirectional channels to unidirectional channels.

For example, in the Consumer-Producer pattern, consumers typically operate on a read-only channel, while producers use a write-only channel. We would explore that a bit later.

## 2. Unbuffered & buffered

### 1) unbuffered channels

- **Define:** a channel created with a capacity of 0 to store data.
- **Create:**
    
    ```go
    // The two channels have equivalent functionalities
    a := make(chan int)
    b := make(chan int, 0)
    ```
    
- **Analog:** there is a narrow canal without docking area. Each ship (data) arriving at the canal must be immediately unloaded by a waiting docker (goroutine). If no docker is ready, the ship must wait at the entrance. Similarly, sending to an unbuffered channel blocks until another goroutine is ready to receive.
- **How it works:**
    - **Sender Attempts to Send**: **w**hen the sending goroutine  sends a value into an unbuffered channel, it waits until another goroutine is ready to receive that value.
    - **Receiver Attempts to Receive**: when the receing goroutine tries to receive from an unbuffered channel, it waits until another goroutine sends a value.
- **Case study: deadlock**
    
    The following code leads to the deadlock. Since it is an unbuffered channel, when executing `intCh <- 1`, the main goroutine would be blocked until another goroutine is ready to receive the data. However, the receiver of the channel is the main goroutine again. The main goroutine would be blocked forever at `intCh <- 1`, causing the deadlock.
    
    ```go
    func main() {
    	intCh := make(chan int)
    	defer close(intCh)
        
    	intCh <- 1
    
    	val, ok := <-intCh
    	fmt.Printf("(%v): %d\n", ok, val)
    }
    ```
    

### 2) buffered channels

- **Define:** channels that are given a *capacity* to store data **when they’re instantiated.
- **Analog:** there is a canal with a docking bay that can hold several ships. Ships can arrive and wait in the docks (buffer) even if no docke is immediately available. Ships are blocked at the entrance only when the docks are all occupied. Similarly, sending to a buffered channel only blocks when the buffer is full, and receiving blocks only when the buffer is empty.
- **How it works:** sending to a buffered channel blocks only if the buffer is full, and receiving blocks only if the buffer is empty.
- Create:
    
    ```go
    a := make(chan int, 5)
    ```
    
- **Example:** Producer-Consumer
    
    In this example, the for loop over the channel breaks when:
    
    1.  The channel is closed, and
    2. All values from the channel have been received.
    
    ```go
    func bufferedChannelExample() {
    	// Create a buffer to store output for synchronized printing
    	var stdoutBuff bytes.Buffer
    	defer stdoutBuff.WriteTo(os.Stdout)
    
    	// Create buffered channel with capacity 4
    	intStream := make(chan int, 4)
    
    	// Producer goroutine
    	go func() {
    		defer close(intStream)
    		defer fmt.Fprintln(&stdoutBuff, "Producer Done.")
    		for i := 0; i < 6; i++ {
    			fmt.Fprintf(&stdoutBuff, "+ Sending: %d (%s)\n", i, time.Now().Format("15:04:05.000"))
    			intStream <- i // Will block when buffer is full (after 4 items)
    		}
    	}()
    
    	time.Sleep(100 * time.Millisecond)
    
    	// Consumer: read until channel is closed and all buffered values are received
    	for integer := range intStream {
    		fmt.Fprintf(&stdoutBuff, "- Received %v (%s).\n", integer, time.Now().Format("15:04:05.000"))
    	}
    }
    ```
    
    ```bash
    # outputs:
    + Sending: 0 (16:32:32.793)
    + Sending: 1 (16:32:32.793)
    + Sending: 2 (16:32:32.793)
    + Sending: 3 (16:32:32.793)
    + Sending: 4 (16:32:32.793)
    - Received 0 (16:32:32.894).
    - Received 1 (16:32:32.894).
    - Received 2 (16:32:32.894).
    - Received 3 (16:32:32.894).
    - Received 4 (16:32:32.894).
    + Sending: 5 (16:32:32.894)
    Producer Done.
    - Received 5 (16:32:32.894).
    ```
    

# Results of channel op

![image.png](/images/blog/golang/goChannel/image.png)

At first glance of this table, it looks as channes could be dangerous to use. However, after examining the motivation of these results and framing the use of channels, it becomes less scary and makes a lot of sense. Here we would introduce how to organize different types of channels.

The first thing we should do is to assgin ***channel ownership***. The **ownership** is defined as being a goroutine that **instantiates, writes and closes a channel**. Then, channel owners have a write-access view into the channel (`chan` or `chan<-`), while the channel utilizers only have a read-only view (`<-chan`).

The second thing is that as a consumer, you should handle the fact that reads can and will block.

To see the full example of code, you can visit: [goChannel](https://github.com/jidalii/go-playground/blob/main/goChannel/main.go).

# References

- Concurrency in Go: Tools and Techniques for Developers 1st Edition ****by Katherine Cox-Buday
- https://medium.com/goturkiye/concurrency-in-go-channels-and-waitgroups-25dd43064d1