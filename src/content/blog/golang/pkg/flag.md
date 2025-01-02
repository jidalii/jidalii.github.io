---
title: "Golang Standard Package: flag"
description: "An overview and usage of the stardard package flag in Go."
date: 2024-11-18
category: "Golang"
tags: ["Golang Standard Package", "CLI"]
---

Package flag implements CLI flag parsing.

# Specifications

## 0. Intro

Let’s start with a simple example:

```go
package main

import (
	"flag"
	"fmt"
	"time"
)

// 1. Define flag varaibles
var (
	host       string
	port       int
	isTestMode bool
	timeout    time.Duration
)

func main() {
	// 2. Bind flags to varaibles
	flag.StringVar(&host, "host", "localhost", "db host")
	flag.IntVar(&port, "port", 3306, "db port")
	flag.BoolVar(&isTestMode, "isTest", true, "isTestMode")
	flag.DurationVar(&timeout, "timeout", 5*time.Second, "db timeout")

	//3. Parse he command line into the defined flags
	flag.Parse()

	fmt.Println("host:", host)
	fmt.Println("port:", port)
	fmt.Println("isTestMode:", isTestMode)
	fmt.Println("timeout:", timeout)
}
```

output:

```bash
❯ go run main.go
host: localhost
port: 3306
isTestMode: true
timeout: 5s

❯ go run main.go -port 4000 -timeout 30s
host: localhost
port: 4000
isTestMode: true
timeout: 30s
```

## 2. Procedures

1. Define flag varaibles
2. Bind flags to varaibles
3. Parse he command line into the defined flags using `flag.Parse()`

## **3. Command line flag syntax**

The following forms are allowed:

1. `-flag` or `--flag`: only for boolean flags.
2. `-flag=x`: use for all types
3. `-flag x`: for non-boolean flags only

<aside>
🔴

Here, `-x` is interpreted as `-x=true`. However, the note indicates a restriction: you cannot use the same shorthand to set a boolean flag to `false`. Instead, you must explicitly specify `-flag=false` to turn off a boolean flag.

</aside>

```bash
// isProd is in default true in this example:
❯ go run main.go --isProd false
isProdMode: true
❯ go run main.go --isProd=false
isProdMode: false
```

## 4. Two types of functions

### `flag.typeVar` v.s. `flag.type`

```go
func StringVar(p *string, name string, value string, usage string)
func BoolVar(p *bool, name string, value bool, usage string)
func IntVar(p *int, name string, value int, usage string)
func DurationVar(p *time.Duration, name string, value time.Duration, usage string)

func String(name string, value string, usage string) *string
func Bool(name string, value bool, usage string) *bool
func Int(name string, value int, usage string) *int
func Duration(name string, value time.Duration, usage string) *time.Duration
```

```go
// flag.typeVar
var x int
flag.IntVar(x, "x", 10, "define x")

// flag.type
var y = flag.Int("y", 20, "define y")
```

## 5. Custom type

If we want to define custom type for CLI, we need to implement the `Value` interface for the new type:

```go
type Value interface {
	String() string  // print value
	Set(string) error  // set flag value
}

type ClusterArray []int

func (arr *ClusterArray) Set(val string) error {
	// disable the flag to be set multiple times
	if len(*arr) > 0 {
		return errors.New("cluster flag already set")
	}
	// type convertion
	for _, val := range strings.Split(val, ",") {
		cluster, err := strconv.Atoi(val)
		if err != nil {
			return err
		}
		*arr = append(*arr, cluster)
	}
	return nil
}

func (arrs *ClusterArray) String() string {
	str := "["
	for _, s := range *arrs {
		str += strconv.Itoa(s)
	}
	str += "]"
	return str
}

func main() {
	var clusters ClusterArray
	flag.Var(&clusters, "clusters", "db clusters")
	flag.Parse()
	fmt.Println("clusters:", clusters)
}
```

output:

```bash
❯ go run main.go -clusters=1,4,6
clusters: [1,4,6]

❯ go run main.go -clusters=1,2 -clusters=5
invalid value "5" for flag -clusters: cluster flag already set

❯ go run main.go -clusters=1,2,i

invalid value "1,2,i" for flag -clusters: strconv.Atoi: parsing "i": invalid syntax
```

## 6. Shorthand

```go
func main() {
	var port int
	flag.IntVar(&port, "p", 3306, "db port (shorthand)")
	flag.IntVar(&port, "port", 3306, "db port")
	flag.parse()
	fmt.Println("port:", port)
}
```

output:

```go
❯ go run main.go -p 1000
port: 1000
❯ go run main.go -port 1000
port: 1000
```

You might find the complete example of codes in this repo: [go-playground](https://github.com/jidalii/go-playground/tree/main/flag)

# References

1. https://pkg.go.dev/flag