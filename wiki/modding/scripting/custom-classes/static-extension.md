---
author: Jamextreme140
desc: This page explains how to use static extension for your mod!
lastUpdated: 2025-09-12T09:50:05.405Z
title: Static Extension
---
# Static Extension

Static extensions can be a powerful tool which allows augmenting types without actually changing them.

Here is a basic Static Extension example:

```haxe
using StringTools;

class IntExtender {
  static public function triple(i:Int) {
    return i * 3;
  }
}

// need to create/import the custom class
// before setting the extension (limitation for now)
using IntExtender;

var str = "  Hello World!  ";

function create() {
  trace(str.trim()); // "Hello World!"
  trace(12.triple()); // 36
}

```

More information about static extension [here](https://haxe.org/manual/lf-static-extension.html).
