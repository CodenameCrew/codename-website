---
author: Ne_Eo, Frakits & Jamextreme140
desc: This page explains how to create custom classes for your mod!
lastUpdated: 2025-09-19T04:13:02.526Z
title: Custom Classes
---
# Custom Classes

Custom classes can be made either inside the script you need it in or you can make a script file corresponding with the name of the class in ``./source``, and using <syntax lang="haxe">import</syntax> to import it.

Here is a basic Song Script code that uses it:
```haxe
package; // Allow `package` declaration. Ignored by the interpreter.

class SpecialSprite extends FlxSprite {
  public static function getSprite(v:String) {
    return new SpecialSprite(v);
  }

  public var customValue(default, set):String = null;
  private function set_customValue(v:String):String {
      if(v == "powerful") 
          trace("I'm powerful!");
      loadGraphic(Paths.image(v));
      return customValue = v;
  }  
        
  public function new(customValue:String) {
      super(200, 400, null);
      this.customValue = customValue;
      //other code stuff
  }

  public override function update(elapsed) {
      super.update(elapsed);
  }
}

function create() {
  var spr = SpecialSprite.getSprite("powerful");
  add(spr);
}
```

## Particularities
As of writing this, this system is limited and also presents some defects. For example:
- You cannot extend FlxGroups or other typed classes *(the ones that end with a ``<T>``)*. This will be implemented in the future.
- Compiled Classes that do not override a function in their code cannot have that function overridden by custom classes. For example, you can't override the `draw` method in a custom class that extends <syntax lang="haxe">FlxParticle</syntax>, because <syntax lang="haxe">FlxParticle</syntax> does not override `draw`. This will be fixed in the future.
- private variables and functions has not effect. They can be accessed as public variables.
- You can only extend a class that is in the packages, `flixel`, `funkin` and `modchart`.
