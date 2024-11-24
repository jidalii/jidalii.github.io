---
title: "WebSockets"
description: "An overview of WebSockets."
date: 2024-11-17
category: "Computer Network"
tags: ["WebSockets", "Application Layer"]
---

# 1. WebSockets

If you’ve already know WebSockets, feel free to skip this part

## 1.1 Intro

### 1) what is WebSockets

- **Which layer:** in Application Layer, just like HTTP
- **TCP-based:** WebSockets work on a TCP connection → can play with TCP connection properties to reduce latency
- **Define:** provide a **full duplex** communication channel over a single TCP connection

---

- **Full duplex:**
    - **Simultaneous communication:** can send messages between each others at the same time
    - **Single persistent connection:** no need to establish a new connection for every messages once connection established
    - **Low latency**
    - **Real-time interaction**

---

### 2) use case

Ideal for applications requiring real-time data update:

- Live chatting
- Video game
- Collaborative editing

### 3) URI schema

`ws:` or `wss:` for a secure WebSocket

## 1.2 How it works

### 1) establish WebSocket connection

1. HTTP handshake
2. Client sends `Upgrade: Websocket`:
    
    include the following in the HTTP header:
    
    ```go
    GET /chat HTTP/1.1
    Host: example.com:8000
    Upgrade: websocket // Request to upgrade HTTP conn to WebSocket conn
    Connection: Upgrade // Request to upgrade conn (must accompany the `Upgrade` header)
    Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==  // A nonce that protects against unauthorized upgrade
    Sec-WebSocket-Version: 13 // 13 is the only accepted version
    ```
    
3. Server responds `101 Switching Protocols`:
    
    ```go
    HTTP/1.1 101 Switching Protocols  // Comfirm the upgrade
    Upgrade: websocket  // Comfirm switch to WebSocket
    Connection: Upgrade
    Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= 
    // Sec-WebSocket-Accept: A hashed and base64-encoded string derived 
    // from the client's Sec-WebSocket-Key to verify the handshake
    ```
    
4. Communicate messages in WebSocket format