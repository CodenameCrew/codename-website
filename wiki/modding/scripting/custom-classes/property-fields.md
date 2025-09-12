---
author: Jamextreme140
desc: This page explains how to use property fields for your mod!
lastUpdated: 2025-09-12T09:49:51.453Z
title: Property Fields
---
# Property Fields (get/set variables)

Next to variables, properties are the second option for dealing with data on a class. However, unlike variables, they offer more control of which kind of field access should be allowed and how it should be generated.

Here is a basic Property Field usage example:

`./songs/script1.hx`

```haxe
public var myvar(default, set):Int;

function set_myvar(val:Int):Int {
  if(val > 10) return myvar = val;
  return val;
}
```

`./songs/[SONG NAME]/scripts/script2.hx`

```haxe
function create() {
    myvar = 20; // This will trigger the set call stored on the field.
}
```

More information about property fields [here](https://haxe.org/manual/class-field-property.html).

## Particularities
As of writing this, this system presents some limitations. For example:
- `(get, null)` or `(null, set)` has no effect for writing nor reading, it acts like (get, default).
- Calling the get/set function directly will trigger that function twice due to accessing the property field on call (if is a real variable, like `(get, null)` or `(default, set)`). For example, calling directly `set_myvar` will call the same function again when tries to write on `myvar`. Avoid doing this unless you have a full property field (a non-real variable, i.e. `(get, set)` or `(get, never)`). This will be fixed in the future.
