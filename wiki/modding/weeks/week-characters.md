---
author: BerGP
desc: How to make custom Story Menu characters.
title: Week Characters
lastUpdated: 2025-02-09T00:10:03.482Z
---

# Week Character
Similar to a character, we gotta make a xml to have him displaying nicely. The folder this time is ``./data/weeks/characters/``.

## <h2 id="week-char" sidebar="Character.xml">XML, The How</h2>

```xml
<char scale="1" x="0" y="0" sprite="menus/storymenu/characters/my-character">
```

This time it's something more simple. The only node we have here is the "parent" one — <syntax lang="xml">&lt;char&gt;</syntax>.

The options available are:
- ``scale``, which scaling to apply to the character. Has a default of 1 when excluded.
- ``x``, X offset. Defaults to 0.
- ``y``, Y offset. Also defaults to 0.
- ``sprite``, which spritesheet to use for the character. When excluded, it defaults to ``menus/storymenu/characters/`` + the xml filename.