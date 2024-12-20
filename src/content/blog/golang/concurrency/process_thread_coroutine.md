---
title: "WTF are process, thread, and coroutine"
description: "Explain concepts of process, thread, and coroutine, and their relationship with goroutine."
date: 2024-12-19
category: "OS"
tags: ["Concurrency", "Goroutine"]
---

# WTF are Coroutine, Thread, and Process

## Hierarchy relationship

- **CPU**: divided into independent **cores** for parallel processing.
- **Core**: Executes **processes**, each managed by the OS.
- **Process**: A running program with its own memory space, scheduled by the OS on a core.
- **Thread**: A lightweight execution unit within a process, sharing its memory, managed by the OS.
- **Coroutine**: A subunit of threads, offering cooperative multitasking, managed by the runtime

```go
CPU
 ├── Core 1
 │    ├── Process 1A (Managed by OS)
 │    └── Process 1B (Managed by OS)
 │            ├── Thread 1B-1 (Managed by OS)
 │            └── Thread 1B-2 (Managed by OS)
 │                    ├── Coroutine i (Managed by runtime)
 │                    └── Coroutine ii (Managed by runtime)
 └── Core 2
      └── Process 2A (Managed by OS)
```

---

- A process can have **multiple threads**.
- A thread can manage **multiple coroutines**.

![image.png](/images/blog/golang/process_thread_coroutine/image1.png)

## Defines

### 1) process

- **Define:** Process is **an instance of an executing program**. I serves as the basic unit for resource allocation by the OS. When a process is running, it requires various resources, like CPU Time, Memory, I/O devices, to complete its execution.
- **The difference between the Process and the Program**: the Program is code in the disk waiting to be exeucted, while the Process is an executing program.
- **Pros & Cons:**
    - **Pro:**
        1. Processes are isolated from each other since each process has its own independent system resources.
        2. No data sharing issues: no need for mechanisms like locks or mutexes to prevent data races or synchronization issues.
    - **Cons:**
        1. High overhead for **process creation** and **context switching** since it invloves OS resource switching.
        2. Complex and slower Inter-Process Communication (IPC).

---

### WTF are concurrnecy & parallel

- **Concurrency:** manage multiple tasks that run in overlapping periods, often on a single CPU core.
- **Parallelism:** run multiple tasks simultaneously on multiple CPU cores or processors.

To better understand the difference, imagine you're in a kitchen alone, preparing dinner. While you alternate between boiling water, chopping meat, and cutting vegetables, you're practicing **concurrency** because you're managing multiple tasks but doing them one at a time. Now, if you and a friend work on these tasks simultaneously—for instance, one boils water while the other chops meat—that's **parallelism**.

![image.png](/images/blog/golang/process_thread_coroutine/image2.png)

---

### 2) thread

- **AKA:** light weight process
- **Define:** a thread is a lightweight unit of execution within a process. It shares memory and resources of its parent process.
- **Pros & Cons of Multithreading:**
    - **Pros:**
        1. **Lightweight:** less overhead for **thread creation** and **context switching**, since threads share recourses.
        2. **Share memory:** threads within the same process can easily share data and resources.
    - **Cons:**
        
        **Race condition:** could lead to synchronization bugs, like deadlock, data races since threads share the same memory.
        

### 3) coroutine

- **Define:** a computer program component that allows execution to be **suspended and resumed**, enabling **non-preemptive** multitasking. As can be seen from the diagram above, Coroutine is fully controlled by **programming runtime *(a user-space scheduler)***, not the OS.
- **Features:**
    - **Lightweight:** creation requires only a few KB while Thread’s creation requires a few MB.
    - **Less overhead:** less overhead for context switching.
    - **Non-preemptive scheduler:** allowing the scheduler or user-defined logic to decide when to switch tasks. But Thread is preemptive, which is scheduled by the operating system
    - **Concurrency:** Coroutine achieve concurrency while Thread achieves true parallelism when executed on multicore processes.

### 4) summary

| Feature | Process | Thread | Coroutine |
| --- | --- | --- | --- |
| Define | An executing program with its own memory space | A lightweight process | a concurrent subroutines that are nonpreemptive |
| Managed By | OS | OS | Programming Runtime |
| Memory Space | Separate memory space | Shared within a process | Shared within a thread |
| Concurrency Type | True parallelism | True parallelism | Cooperative concurrency |
| Creation & Switch Cost | High | Moderate | Very low |

# Goroutine

### **define**

Goroutines are not OS threads not exactly coroutines. Goroutines integrate deeply with Go’s runtime. While coroutines define their suspension or reentry points, goroutines don’t. 

Instread, Go’s runtime observes the runtime behavior of goroutines:

- automatically suspends them when they are blocked, and
- resume them when they are unblocked

This feature makes goroutines **preemptable** only when goroutines have become blocked. Thus, goroutines are **a special class of coroutines**.

### features

1. **Preemptive when when goroutines have become blocked**
2. **Lightweight and Auto-Scaling:** each goroutines only need a few KB, which is almost always enough. If isn’t, the runtime grows or shrinks the memory for stroing the stack automatically.
3. **Cheap Context Switching:** context switching in software is way cheaper than that in OS.

### max number of goroutines

- **Factors of limit of the max number of goroutines:**
    1. Available memory
    2. Scheduler’s ability to manage goroutines
- **Formula:** $Max\ Goroutines = RAM\ Size / Avg\ Goroutine\ Size$

<aside>
🔴

**Attention:** `GOMAXPROCS` controls max number of concurrent OS threads for goroutines, not the number of goroutines.

</aside>

![image.png](/images/blog/golang/process_thread_coroutine/image3.png)

# References

- https://go.dev/doc/faq#goroutines
- https://go.dev/blog/waza-talk
- https://manfonly.medium.com/simple-understanding-of-coroutines-6895c3767648
- https://blog.kennycoder.io/2020/05/16/%E9%80%B2%E7%A8%8B-Process-%E3%80%81%E7%B7%9A%E7%A8%8B-Thread-%E3%80%81%E5%8D%94%E7%A8%8B-Coroutine-%E7%9A%84%E6%A6%82%E5%BF%B5%E8%AC%9B%E8%A7%A3/
- [https://dev.to/crusty0gphr/tricky-golang-interview-questions-part-8-max-goroutine-number-1ep2#:~:text=Go doesn't set a,ability to manage them efficiently](https://dev.to/crusty0gphr/tricky-golang-interview-questions-part-8-max-goroutine-number-1ep2#:~:text=Go%20doesn't%20set%20a,ability%20to%20manage%20them%20efficiently)