---
author: Frakits
desc: This page explains how to script the engine
lastUpdated: 2025-09-12T09:36:28.820Z
title: Scripting
---
# Scripting

The engine's biggest feature yet, scripting.<br>
Currently, you can script in HScript *(haxe scripting language)*, or in NDLL format *(compiled C++ code)*, but mainly in HScript, which should make the experience similar to coding in source code.<br>
Scripting can change not only gameplay, but also menus and other engine functions.<br>

We will focus on writing in HScript, so whenever you have to create a script, the filename has to end with an ``.hx``.<br>
*(you can also use ``.hscript``, ``.hxc`` and ``.hxs``)*

## <h2 id="console" sidebar="Using console for debug">Scripting relies heavily on having a console opened at all times.</h2>
The console helps you track down errors and bugs with your script. To access it, you can either:
- Press F2 to open a window, or
- Start the game in a cmd or powershell window (or in terminal for linux/mac users)

## <h2 id="special-syntax" sidebar="Special Syntax">Our HScript accepts special syntax from Haxe 4.3.x</h2>
Things like ``?.``, ``??`` and ``??=`` are accepted in our HScript language.<br>
Using those is beneficial as they prove to be very useful to keeping your code clean.<br>
Example usage:
```haxe
if (FlxG.sound.music != null) trace(FlxG.sound.music.time);

trace(FlxG.sound?.music);
```
```haxe
var time:Float;
if (FlxG.sound.music != null) time = FlxG.sound.music.time;
else time = 0;

time = FlxG.sound?.music ?? 0;
```
```haxe
if (FlxG.save.data.isOpen == null) FlxG.save.data.isOpen = true;

FlxG.save.data.isOpen ??= true;
```

## <h2 id="events">Script Events</h2>

Scripting relies heavily on **Events**, which triggers callbacks and returns a struct of parameters, basically unclogging the parameter list of functions.<br>
Which means, handling a note hit looks something like this:
```haxe
function onNoteHit(event) {
    trace(event.note); // the note that has been hit
    trace(event.score); // how much score gained from this
    event.cancel(); // cancels out any other handling (useful if you want to write custom note pressing)
}
```
There's a lot of other events, such as <code class="hljs-title">onStartCountdown</code>, <code class="hljs-title">onGamePause</code>, <code class="hljs-title">onCameraMove</code> and more.<br>
You can find them all in <a href="./script-calls.md">All of the script calls</a>.

Despite all of that, functions like <code class="hljs-title">update</code>, <code class="hljs-title">beatHit</code>, <code class="hljs-title">stepHit</code> still receive one parameter *(<syntax lang="haxe">elapsed:Float</syntax>, <syntax lang="haxe">curBeat:Int</syntax>, <syntax lang="haxe">curStep:Int</syntax>)*

## <h2 id="class-importing">Importing Classes</h2>

Some classes are pre-imported (<syntax lang="haxe">FlxSprite</syntax>, <syntax lang="haxe">FlxMath</syntax>, <syntax lang="haxe">FlxAxis</syntax> etc.), but for classes that aren't pre-imported, it's still possible to import like this:
```haxe
import flixel.addons.display.FlxBackdrop;
```
*(<code class="hljs-keyword">using</code> does not work, yet)*

## <h2 id="script-variables">Script Variables</h2>

We have a special variable named `__script__` that points to the script that is currently being executed.

## To start on basic scripting, you can follow these articles here:
- <a href="./playstate-scripts/gameplay-scripts.md">Gameplay Scripts</a>
- <a href="./playstate-scripts/events-notetypes-scripts.md">Events/Notetype Scripts</a>
- <a href="./state-substate-scripts.md">State/Substate Scripts</a><br><br>
- <a href="./script-snippets.md">Useful script snippets for modders</a>
- <a href="./script-calls.md">All of the script calls</a>

And if you wanna go advanced, follow the rest of the articles here:
- <a href="./features/index.md">Scripting Features</a>
- <a href="./playstate-scripts/pause-gameover-scripts.md">Pause/Game Over Scripts</a>
- <a href="./playstate-scripts/cutscenes-dialogue-scripts.md">Cutscenes/Dialogue Scripts</a>
- <a href="./playstate-scripts/character-stage-scripts.md">Character/Stage Scripts</a><br><br>
- <a href="./global-scripts.md">Global Scripts</a>
- <a href="./custom-options.md">Custom Options</a>
- <a href="./shaders.md">Shaders</a>
- <a href="./3d-rendering.md">3D rendering</a>
- <a href="./hxvlc.md">Using hxvlc for videos</a><br><br>
- <a href="./scripted-assets-libraries.md">Scripted Assets Libraries</a>
- <a href="./ndll-scripting.md">NDLL Scripting</a>
- <a href="./custom-transitions.md">Custom Transitions</a>