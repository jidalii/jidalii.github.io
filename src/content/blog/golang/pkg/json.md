---
title: "Golang Standard Package: encoding/json"
description: "An overview and usage of the stardard package encoding/json in Go."
date: 2024-11-21
category: "Golang"
tags: ["Golang Standard Package", "JSON"]
---

# 1. Intro & How to use

There are two main functions in the `encoing/json` package: `Marshal`, and `Unmarshal`:

- `Marshal(v any) ([]byte, error)`: encode Golang object into JSON.
- `Unmarshal(data []byte, v any) error`: decode JSON to Golang object.

Here, the Golang object refers to both `struct` and `slice`, `map`.

## 1.1 Marshal

```go
package main

import (
	"encoding/json"
	"fmt"
)

type Employee struct {
    Name string `json:"name"`
    Position string `json:"position"`
    Age int `json:"age"`
    Salary uint64 `json:"salary"`
}

func main() {
    // 1. Golang object -> JSON
    employee1 := Employee{
        Name: "Alice",
        Position: "Manager",
        Age: 30,
        Salary: 5000,
    }
    jsonData, err := json.Marshal(employee1)
    if err != nil {
        fmt.Println("Error marshaling JSON:", err)
        return
    }

    fmt.Println(string(jsonData))
}
// output:
// {"name":"Alice","position":"Manager","age":30,"salary":5000}

```

## 1.2 Unmarshal

```go
func main() {
	 // 2. JSON -> Golang object
    jsonStr := `{"name":"Bob","position":"Developer","age":25,"salary":4000000}`
    var employee2 Employee
    err = json.Unmarshal([]byte(jsonStr), &employee2)
    if err != nil {
        fmt.Println("Error unmarshaling JSON:", err)
        return
    }
    fmt.Println(employee2)
}
// output:
// {Bob Developer 25 4000000}
```

## 1.3 JSON tag options

- **`json:"key"`**: Specify the key in the JSON output.
- **`json:"key,omitempty"`**: Omit the field if it is empty (i.e., zero value).
- **`json:"-"`**: Ignore the field (do not marshal or unmarshal it).

# 2. Attentions!!!

### 1) pubic fields

When using a struct to handle JSON, the strut’s fields must be **public**, i.e. the field names must start with an **uppercase letter**.

- **Example:**
    
    ```go
    type Employee struct {
        Name string 
        Position string 
        Age int 
        **salary uint64  // private field**
    }
    func main() {
        jsonStr := `{"name":"Bob","position":"Developer","age":25,"salary":4000000}`
        var employee2 Employee
        err = json.Unmarshal([]byte(jsonStr), &employee2)
        if err != nil {
            fmt.Println("Error unmarshaling JSON:", err)
            return
        }
        fmt.Println(employee2)
    }
    // when unmarshaling, we cannot read correct value of `salary`
    // output:
    // {Bob Developer 25 **0**} 
    ```
    

> [!IMPORTANT]
> In Go, the language design **prohibits reflection from accessing private struct fields**. This is done intentionally to enforce the principles of **encapsulation** and **data privacy**.


### 2) avoid using `map`

Avoid using map, because map brings extra cost, extrac code, and extra maintenance cost.

**Why consider `struct` before `map`:** `struct` defines the fields and their types ahead, while `map` has no constraints to data → `map` cannot constraint the change of JSON, bring extra work and mantenance cost.

```go
func main() {
	var m map[string]any
    err = json.Unmarshal([]byte(jsonStr), &m)
    if err != nil {
        fmt.Println("Error unmarshaling JSON:", err)
        return
    }
    // lots of codes for maintaining the map
    name, ok := m["name"].(string)
    if !ok {
        fmt.Println("Error type assertion")
        return
    }
    fmt.Println(name)
    // extra work for other fields...
}
```

### 3) repeat unmarshaling

**Dirty data contamination:** the fields that were not explicitly overwritten in the second JSON data retain their values from the previous unmarshalling

**Solution:** whenever unmarshaling JSON, use a new struct object to load the data

```go
func main() {
		// First JSON string with the salary field
		jsonStr3 := `{"name":"Bob","position":"Developer","age":25,"salary":4000000}`
	  var employee Employee
	  _ = json.Unmarshal([]byte(jsonStr3), &employee)
	  fmt.Println("employee3:", employee)
		// Second JSON string without the salary field
	  jsonStr4 := `{"name":"Kate","position":"Senior Developer","age":35}`
	  // Salary remains 4000000
	  _ = json.Unmarshal([]byte(jsonStr4), &employee)
	  fmt.Println("employee4:", employee)
}
// outputs:
// employee3: {Bob Developer 25 4000000}
// employee4: {Kate Senior Developer 35 **4000000**}
```

### 4) confusion brought by default value

In Golang, the default value of `int` is `0`, `string`’s is `“”`, `pointer`’s is `nil`, etc.

**Issue:** with the approach above, we cannot distinguish the difference between missing object, or the case that value is indeed default value.

**Solution:** by changing the field to pointer, we can **use pointer’s `nil` to distinguish the difference**.

```go
func ZeroValueConfusion() {
	str := `{"name":"Bob","position":"Developer","age":25,"salary":100}`
	var p Employee
	_ = json.Unmarshal([]byte(str), &p)
	fmt.Printf("ZeroValueConfusion: %+v\n", p)

	str2 := `{"name":"Bob","position":"Developer","age":25}`
	var p2 Employee
	_ = json.Unmarshal([]byte(str2), &p2)
	fmt.Printf("ZeroValueConfusion: %+v\n", p2)
	if p2.Salary == nil {
        fmt.Println("Salary is nil")
  }
}

// outputs:
// {Name:Bob Position:Developer Age:25 Salary:0x1400000e2f0}
// {Name:Bob Position:Developer Age:25 Salary:<nil>}
// p2.Salary is nil
```

### 5) JSON tags

- **Confusion brought by default value:** default value or missing value

```go
type Employee struct {
	Name     string `json:"name"`
	Position string `json:"position"`
	Age      int    `json:"age,omitempty"`
	Salary   uint64 `json:"salary,omitempty"`
}

func TagMarshal() {
	p := Employee{
		Name:   "Bob",
		Salary: 0,
	}
	output, _ := json.MarshalIndent(p, "", "  ")
	println(string(output))
}
// outputs:
// {
//   "name": "Bob",
//   "position": ""
// }
```

- **Solution:** use pointer
    
    ```go
    type Employee struct {
    	Name     string  `json:"name"`
    	Position string  `json:"position"`
    	Age      int     `json:"age,omitempty"`
    	Salary   *uint64 `json:"salary,omitempty"`
    }
    
    func TagMarshal() {
    	p := Employee{
    		Name:   "Bob",
    		Salary: new(uint64),
    	}
        *p.Salary = 100
    	output, _ := json.MarshalIndent(p, "", "  ")
    	println(string(output))
    }
    
    // outputs:
    // {
    //   "name": "Bob",
    //   "position": "",
    //   "salary": 100
    // }
    ```
    

---

You may find the full example of the code here: https://github.com/jidalii/go-playground/tree/main/parse-json

# References

- https://go.dev/blog/json
- https://pkg.go.dev/encoding/json#section-documentation
- https://medium.com/hprog99/working-with-json-in-golang-a-comprehensive-guide-5a94ca5961a1