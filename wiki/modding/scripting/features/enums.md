---
author: Jamextreme140
desc: This page explains how to use scripted enums for your mod!
lastUpdated: 2025-09-12T08:53:13.034Z
title: Enums
---
# Enums

Enums are a good choice if only a finite set of values should be allowed. It can be made inside the script you need it in.

Here is a basic Enum Script example:

```haxe
enum TypeValue {
  NUMBER(n:Int);
  DECIMAL(d:Float, ?p:Int);
  CHARACTER(s:String);
  BOOLEAN(b:Bool);
}

var type:TypeValue;

function create() {
  type = TypeValue.DECIMAL(10.1234, 2);
  
  // You need to type the full enum field for each case
  // i.e. you can't type the enum field directly (limitation for now)
  switch(type) {
    case TypeValue.NUMBER(number): 
      trace("number: " + number);
    case TypeValue.DECIMAL(decimal, precision): 
      if(precision != null)
        trace("decimal: " + decimal + " | rounded decimal: " + roundDecimal(decimal, precision));
      else
        trace("decimal: " + decimal);
    case TypeValue.CHARACTER(char): 
      trace("character: " + char);
    default: 
      trace("unknown type");
  }
}
  

function roundDecimal(Value:Float, Precision:Int) {
  var mult:Float = Math.pow(10, Precision);
  return Math.fround(Value * mult) / mult;
}
```

Supports Enum matching with arguments for switch statements (for real and scripted enums).
