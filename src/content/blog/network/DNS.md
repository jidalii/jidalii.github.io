---
title: "Application Layer: DNS"
description: "An overview of DNS."
date: 2024-10-26
category: "Computer Network"
tags: ["DNS", "Application Layer"]
---

## Overview

- **Define:** a distributed, hierarchical database
- Run on UDP
- **Hierarchy:**
    
    ![image.png](/images/blog/DNS/hierarchy.png)
    
- Three classes of DNS servers:
    - root server
    - TLD (Top-level domain) server
    - authoritative server

## Resource record (RR)

- A resource record is a **four-tuple** that contains the following fields:
    
    `(Name, Value, Type, TTL)`
    

### `Type`

- `A`: provides the standard hostname-to-IP address mapping ***(IPv4)***
    - `Name`: a **hostname**
    - `Value`: **IP for the hostname**
- `AAAA` ***(IPv6)***
- `CNAME`: `Value` is a canonical hostname for the alias hostname `Name`
- `NS`:
    - `Name`: a **domain**
    - `Value`: the **hostname of an authoritative DNS server** for this domain

| name | type | value |
| --- | --- | --- |
| bu.edu | A (IPv4) | 127.128.3.10 |
| bu.edu | AAAA (IPv6) |  |
| www.akamai.com | CNAME | www.akami.com.edgekey.net |
| bu.edu | NS | ns1.bu.edu |

## DNS server categories

### DNS root nameserver

- **Provide:**
    1. `(.edu, NS, TLD)`
    2. `(TLD, A, TLD-IP)`
- **Job:** maintain information for all the domain names that share a common **domain extension *(.com, .xyz, .net)***

### TLD nameserver

- **Provide *(edu TLD server)*:**
    - `(bu.edu, NS, auth)`
    - `(auth, A, auth-IP)`

### Authoritative nameserver

- **Run and Maintain** by universities and organizations which hold mapping from hosts to IP addresses
- Provide:
    - `(bu.edu, A, bu.edu-IP)`

## DNS name resolution

- once (any) name server learns mapping, it caches mapping
- cache entries timeout (disappear) after some time (TTL)


> 🟡 **Attention**
> 
> DNS procedure: 问路但不带路

![image.png](/images/blog/DNS/flow.png)

> 🔴 **Caution**
> 
> **Why DNS system sends back both the `NS` record and the `A` record?**
>
>Because IP changes frequently while the domain name never changes.
>
>It is more caching efficient, since including both the `NS` and `A` records helps reduce the number of query. By receiving the both, it is more efficient to update `A` records.


## Protocol messages

![image.png](/images/blog/DNS/msg.png)