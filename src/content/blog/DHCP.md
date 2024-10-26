---
title: "DHCP in Computer Network"
description: ""
date: 2024-10-26
tags: ["Computer Network", "DHCP", "Application Layer"]
---

## Define

- The **first client/server application program** that is used after a host is boosted

A network protocol that **automatically assigns IP addresses and other network configuration settings** (such as DNS servers, subnet masks, and default gateways) to devices on a network. 

This allows devices to communicate on the network **without requiring manual configuration**, making network management easier and more efficient.

## Four params required to connect to the Internet

1. Host IP
2. IP of a name server (DNS server)
3. Subnet mask
4. IP of the default gateway

<aside>
🟢

DHCP uses UDP, instead of TCP.

- DHCP communication is time-sensitive and not require the reliability mechanisms.
- UTP is a **connectionless** protocol, making it faster for use in DHCP.
- Using TCP would introduce unnecessary overhead.

</aside>

### special PIv4 address

- **`0.0.0.0`:** reserved for communication when a host needs to send an IPv4 packet but it does **not know its own address yet**
- **`255.255.255.255`:** reserved for **limited broadcast**

## workflow

![image.png](/images/blog/DHCP/dhcp_flow.png)

### 1) DHCP discovery: client → server

- **Meaning:** broadcast a message to all devices present in a network to find the DHCP server
- `transaction_id`: set by the client and used to match a reply with the request
- **src IP:**
    - `0.0.0.0` (used when we don’t know our IP address)
    - port 68
- **dest IP:**
    - `255.255.255.255` (used when doing limited broadcast: broadcasting messages to all hosts on the **same local network** or subnet)
    - port 67

### 2) DHCP offer: server → client

- **Meaning:** server will respond to the host in this message specifying the unleased IP address and other TCP configuration information.
- **Behaviors:**
    - **Server:** lock the offered IPs
    - **Client:** accept the first offer if ***more than one DHCP server*** present and respond in the network
- src:
    - `SIP:67`
- dest:
    - `255.255.255.255:68`

<aside>
🟢

The well-known port is reserved 

</aside>

### 3) DHCP request: client → server

- **Behaviors:**
    - **Client:**
        1. notify the DHCP server whether it accepts the proposed IP configuration or not
        2. Let others know the IP address so that other servers can **release to lock for the offer**
- **src:** `0.0.0.0:68`
- dest: `255.255.255.255:67` (to let others know the IP address so that other servers can release to lock)

### 4) DHCP ack: server → client

- **Meaning:** confirm to the DHCP client that it can use the offered IP configuration
- src: `ISP:68`
- dest: `255.255.255.255:67`