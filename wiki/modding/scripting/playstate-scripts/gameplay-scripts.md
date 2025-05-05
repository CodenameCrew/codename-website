---
author: Frakits
desc: This page explains how to use Gameplay Scripts in your mod!
lastUpdated: 2025-05-02T18:08:41.000Z
title: Gameplay Scripts
---
# Gameplay Scripts

## <h2 id="gameplay-scripts" sidebar="Gameplay Scripts">Gameplay scripts run during gameplay *(yep)*</h2>

You can run Gameplay Scripts in **a song**, by putting the scripts in ``./songs/YOUR SONG/scripts``, or run them in **every song**, by putting them in the ``./songs`` folder itself.

Gameplay Scripts can change the gameplay in various ways. For example, here's how you can hide the player character:
```haxe
function create() {
    boyfriend.visible = false;
}
````

Or how to create a normal sprite:

```haxe
function create() {
    var sprite = new FlxSprite(x, y).loadGraphic(Paths.image("my new sprite")); // Picks the PNG image from the ./images folder
}
```

If you notice, this looks slightly like source code, aside from the usual <syntax lang="haxe">override function</syntax> or <syntax lang="haxe">super.create()</syntax>, which do not exist in our scripting language.<br>
If you're already familiar with source coding, scripting will feel like a breeze. If not… well… prepare to learn!

## <h2 id="particularities">Particularities</h2>

### Accessing characters

Characters are actually accessed differently. Due to the modularity of having more than one Strumline, and more than one character in a Strumline, characters are accessible like this:

```haxe
trace(strumLines.members[0].characters[0]); // Opponent character
trace(strumLines.members[1].characters[0]); // Player character
trace(strumLines.members[2].characters[0]); // Girlfriend character
```

Though we’ve also established a few shortcuts to avoid typing this much code:

```haxe
trace(dad);
trace(boyfriend);
trace(gf);
```

### Replacing `mustHitSection`

Sections do not exist, and therefore, `mustHitSection` no longer works. As a workaround, you can use `curCameraTarget` instead:

```haxe
if (curCameraTarget == 1) // Equivalent to mustHitSection == true
```

### Difficulty-Based Scripts

You can also add **Difficulty Based scripts** by placing them in a subfolder named after the difficulty inside the song’s scripts folder.<br>
For example the scripts inside `songs/dadbattle/scripts/erect/` will only get loaded if the current difficulty is `erect`.

