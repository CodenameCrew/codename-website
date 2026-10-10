---
author: eclipsetrust
desc: This page explains how to use NDLLs
lastUpdated: 2026-09-28T22:39:15Z
title: NDLL Scripting
---
# NDLL Scripting
NDLL scripting are pieces of code that HScript can't handle such as window transparency.

Custom NDLLS methods can receive arguments(1 to 15 arguments) or receive no arguments at all.
Custom NDLLS can also return values such as int, float, string, etc.

## NDLL Scripting Examples
Here are some examples of Scripted NDLLS.

No arguments any type accepted for return:
```cpp
static value hello_ndll() {
	return alloc_string("Hello not specific from NDLL Example!"); // Converts into a Haxe string
}
DEFINE_PRIME0 (hello_ndll); // This means we not receiving args from Haxe 
```

Arguments received and also any type accepted for return:
```cpp
static value sum_numbers(int num1, int num2) {
	return alloc_int(num1 + num2); // Converts into a Haxe integer
}
DEFINE_PRIME2 (sum_numbers); // We getting two args from Haxe
```

No arguments and void return
```cpp
static void void_return_method() {
	int idk = 0;
}
DEFINE_PRIME0v (void_return_method); // What defines void return is v after the 0
```

Method return defined depending in the OS:
```cpp
#if defined(HX_WINDOWS)

static value hello_os() {
	return alloc_string("Hello for Windows from NDLL Example!");
}
DEFINE_PRIME0 (hello_os);

#endif

#if defined(HX_LINUX)

static value hello_os() {
	return alloc_string("Hello for Linux from NDLL Example!");
}
DEFINE_PRIME0 (hello_os);

#endif

#if defined(HX_MACOS)
static value hello_os() {
	return alloc_string("Hello for MACOS from NDLL Example!");
}
DEFINE_PRIME0 (hello_os);

#endif
```
Or can also be done with:
```cpp
#if defined(HX_WINDOWS)
static value hello_os() {
    return alloc_string("Hello for Windows from NDLL Example!");
}
DEFINE_PRIME0 (hello_os);
#else
static value hello_os() {
    return alloc_string("Hello to any other OS that isn't Windows");
}
DEFINE_PRIME0 (hello_os);
#endif
```

(For more information check [the example project](https://github.com/CodenameCrew/ndll-example/blob/master))

## NDLL Usage In HScript
After compiling your NDLL, you should put it in ``./ndlls/``.
After that to use your NDLL you should read it using:
```haxe
import funkin.backend.utils.NdllUtil; // import to read NDLLS

/* First argument is ndll name(Codename already finds which OS is being used)
Second argument is the method you want to use
Third argument is how many arguments there is in the ndll method.*/
static var ndllexample = NdllUtil.getFunction("ndllexample", "hello_os", 0);
var ndllreturn = ndllexample();
```
