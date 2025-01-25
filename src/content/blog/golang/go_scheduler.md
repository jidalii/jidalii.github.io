---
title: "Goroutines and Go Scheduler"
description: "This blog introduces you to how goroutines work and the Go's G-P-M model."
date: 2025-01-10
category: "Golang"
tags: ["Goroutine", "Scheduler"]
---

# 0. Goroutine Scheduler

When discussing "scheduling," the first thought is often the scheduling of processes and threads at the operating system (OS) level. The OS scheduler coordinates multiple threads in the system, assigning them to physical CPUs according to specific scheduling algorithms. In traditional programming languages such as C’s concurrency is primarily achieved through OS-level scheduling. The program is responsible for creating threads (commonly using libraries like `pthread`), while the OS handles the scheduling. However, this conventional method of implementing concurrency comes with various limitations:

1. **Complexity:** easy creation but hard to exit.
2. **High scaling cost:** although threads have lower costs than processes, we still cannot create a large number of threads. Because each thread consumes the **considerable resources**, and the cost of **context switching between threads** by the operating system is also substantial.

# 1. About Threads

Goroutines are based on threads. Let’s take a look at three thread models:

1. Kernel-level threads
2. User-level threads
3. Two-level threads (hybrid model)

The biggest difference between these models lies in how user threads correspond to Kernel Scheduling Entities (KSE). KSE is a kernel-level thread, the smallest scheduling uint in the OS.

## 1) User-level threads

User threads and kernel thread KSE follow a **many-to-one (N:1)** mapping model. Multiple user threads typically **belong to one single process**, and their scheduling is handled by the user’s own thread library (at user-level). Operations such as thread creation, destruction, and coordination between threads are all managed by the user-level thread library without the need for system calls. For instance, the ***Python’s coroutine library gevent*** uses this approach.

All the threads created in one process are dynamically bound to the same KSE at runtime. In other words, the OS is only aware of the user process and has no awareness of the threads within it (because the ***OS kernel sees the process as a whole***).

Since thread scheduling is handled at the user level, it avoids the need for context switching between user mode and kernel mode and thus this approach is lightweight.

However, this model has an inherent drawback: it **cannot achieve true parallelism**. If one user thread within a process is interrupted by the CPU due to a blocking operation, all threads within that process will also be blocked.

## 2) Kernel-level threads

User-level threads and kernel thread KSE follow a **one-to-one (1:1)** mapping model. Each user thread binds to one kernel thread, and their scheduling is handled by the OS’s kernel. Most thread libraries, such as ***Java’s Thread and Cpp’s thread***, encapsulates the kernel threads, and **each  thread created by the process binds to its own KSE**.

The pro of this model is achieving true concurrency through the OS’s kernel thread and its scheduler for fast context switching.

The con is its high resource cost and performance issue.

## 3) Two-level threads

Kernel-level threads and kernel thread KSE follow a **many-to-many (N:M)** mapping model. This model combines the advantages of both user-level and kernel-level threading models while avoiding their respective drawbacks:

1. **Multiple KSEs per Process:** Allow multiple threads within the same process to run concurrently on different CPUs.
2. **Shared KSEs:** 
    
    Threads are **not uniquely bound** to specific KSEs. Multiple user threads can share the same KSE.
    
    When a KSE becomes **blocked** due to a blocking operation, the remaining user threads in the process can **dynamically rebind to other available KSEs** and continue running.
    

# 2. G-P-M model in Go

## 2.1 Intro

Each OS thread has a **FIXED-size** memory (typically 2MB) for its stack. This fixed size is too large and too small to some extents. While it is too large for some simple tasks, like generating periodical signals, it is too small for some complex tasks, like deep recursions. Therefore, goroutine is born.

Each goroutine is an independent executable unit. Instead of being assigned with a fixed memory stack size, goroutine sticks with dynamic adapting approach:

- A goroutine’s stack starts with 2 KB and dynamically grows and shrinks as needed, up to max 1 GB on 64-bit (256 MB on 32-bit)

This dynamic stack **growth** is FULLY MANAGED by **Go Scheduler**. And **Go GC** periodically reclaims unused memory and **shrinks** stack space, further optimizing resource usage.

## 2.2 Structures

### **1) Goroutine (`G`):**

Each Goroutine corresponds to a `G` structure, which stores Goroutine’s runtime stack, state, task function. `G`s can be reused, but are not execution entities themselves. To let `G`s to be scheduled and executed, it must be bound to a `P`.

### **2) Logical Processor (`P`):**

- From the perspective of `G`s, Ps function like a **“CPU”** - it `G`s must be bound to a `P` (via the P’s local run queue) to be scheduled for execution.
- For `M`s, `P`s provide the **necessary execution context** (memory allocation state, task queues, etc.)
- **# of `P`s determines the max number of `G`s that can run concurrently** (assume # of CPUs ≥ # of `P`s). # of `P`s is determined by `GOMAXPROCS` and max # of `P`s is 256.

***Analogy:*** Think `G` as a task to be completed, `M` as a factory worker, and `P` as the workstation. For a task to be scheduled, it must be assigned to a `P`.`M` does not carry tools with them. Instead they go to `P` to pick up the tools (memory cache) and tasks (`G`) needed for the job, and return to `P` once completed.

### **3) Thread (`M`)**

The abstraction of thread. `M` represents the **actual computational resource** that performs the execution. After binding to a valid `P`, `M` enter the scheduling loop.

- The scheduling loop works as:
    1. Fetch a `G` from the global queue, the local queue of the bound `P`, or the wait queue.
    2. Switch to the `G`'s execution stack and run the `G`'s task function.
    3. Perform cleanup using `goexit` and return to `M` to repeat the process.

`M` does not retain `G`’s state, which allows `G`s to be rescheduled across different `M`s. The # of `M` is adjusted by Go Runtime. To prevent creating too any OS threads from **overwhelming the system schedule**, the max # of `M`s is 10,000.

![image.png](/images/blog/golang/goroutine/gpm.png)

## 2.3 Depreciated goroutine scheduler

In the initial versions of Go, the scheduler uses G-M model, without P. Since the model has own one global queue for G, it suffers issue of:

1. **One Global Mutex:** For `M`s, executing or returning a `G` requires access to the global G queue. Since there are multiple `M`s, a global lock (`Sched.Lock`) is required to ensure mutex and synchronization.
2. **Goroutine Passing Issue:** Goroutines in the runnable state are frequently passed between different `M` → delay and overhead.
3. **Memory Caching by Each `M`**: Each `M` maintains its own memory cache → excessive memory usage and poor data locality.
4. **`Syscall`-Induced Blocking**: Intense blocking and unblocking of worker threads caused by `syscall` invocations result in additional performance overhead.

![image.png](/images/blog/golang/goroutine/gm.png)

## 2.4 G-P-M

### **1) working-stealing mechanism**

Due to the poor concurrency performance of the G-M model, G-P-M and the scheduling algorithm **Working-Stealing Mechanism** were introduced:

1. Each `P` keeps a local run queue to store `G` that are ready to execute.
2. When a new `G` is created or transitions to a runnable state, it is added to the local run queue of the associated `P`.
3. When a `G` finishes executing on an `M`, `P` removes it from its local queue.
    1. If the queue is not empty, the next `G` in the queue is executed.
    2. If the queue is empty, it attempts to steal `G`s from other **threads bound to the same `P`**, rather than terminating the thread.

### 2) components

1. **Global queue:** Store waiting-to-run `G`s. The global queue is a shared resource accessible by any P and is secured by a mutex.
2. **`P`'s Local Queue:** Contain waiting-to-run Goroutines, but with a limited capacity (256 top). When a new Goroutine `G` is created, it is **initially added to the `P`'s local queue**. If the local queue becomes **full**, **half of its Goroutines are moved to the global queue**.
3. **`P` List:** All `P`'s are created at program startup and are stored in an array.

![image.png](/images/blog/golang/goroutine/gpm.png)

### 3) exceptions

Go Runtime would execute another goroutine when the goroutine is blocked due to the following four cases:

1. Blocking syscall
2. Network input
3. Channel operations
4. Primitives in the sync package

---

1. **User state blocking/ waking:**
    
    When goroutine is blocked by channel ops, the corresponding `G` would be moved to a wait queue (such as a channel's `waitq`). The state of `G` changes from `running` to `waiting`. `M` would skips this `G` and attempts to execute the next `G`. 
    
    If there are no runnable `G`s available:
    
    - The `M` **unbinds from the `P`** and goes into a `sleep` state.
    - he `P` is now free to assign runnable tasks to other `M`s.
    
    When the Blocked Goroutine is Woken Up:
    
    - When the blocked `G` is woken up by another `G`, it is marked as runnable
    - The runtime would attempts to add this `G` to:
        1. The **runnext** slot of the `P` where `G2` resides
        2. If the `runnext` slot is full, it is added to the `P`'s **local queue**.
        3. If the local queue is full, it is added to the **global queue**.
2. **Syscall blocking:**
    
    When a `G` is blocked due to a system call:
    
    - `G`’s state changes to `_Gsyscall`.
    - `M` executing this `G` enters a `blocked` state.
    
    Handling the Blocked `M`:
    
    - The blocked `M` **unbinds from the `P`**.
    - The `P` becomes available and:
        1. **Binds to another idle `M`** if one exists and continues the execution on its local queue.
        2. If no idle `M` is available but there are `G`s in the `P`'s local queue, the runtime **creates a new `M`** to bind to the `P` and execute those `G`s.
    
    When the System Call Completes:
    
    - `G` is marked as **runnable** and attempts to acquire an idle `P` to resume execution.
    - If no idle `P` is available, `G` is added to the **global queue**.

# References

https://dev.to/aceld/understanding-the-golang-goroutine-scheduler-gpm-model-4l1g

https://tonybai.com/2017/06/23/an-intro-about-goroutine-scheduler/

https://docs.google.com/document/d/1ETuA2IOmnaQ4j81AtTGT40Y4_Jr6_IDASEKg0t0dBR8/edit?tab=t.0#heading=h.3pilqarbrc9h

https://wenzhiquan.github.io/2021/04/30/2021-04-30-golang-scheduler/