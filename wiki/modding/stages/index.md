---
author: Frakits & Ne_Eo & Nex_isDumb
desc: How to make custom stages.
lastUpdated: 2024-09-20T15:19:41.000Z
title: Creating Stages
---
# Creating Stages
Stages are defined via XML files, similar to <a href="../characters/">Creating characters</a>. By creating an XML file in ``./data/stages``, you officially created a stage.

The default stage XML looks something like this:
```xml
<stage zoom="0.9" name="stage" folder="stages/default/" startCamPosY="600" startCamPosX="1000">
    <sprite name="bg" x="-600" y="-200" sprite="stageback" scroll="0.9"/>
    <sprite name="stageFront" x="-600" y="600" sprite="stagefront" scroll="0.9"/>
    <girlfriend/>
    <dad/>
    <boyfriend/>
    <sprite name="stageCurtains" x="-500" y="-300" sprite="stagecurtains" scroll="1.3"/>
</stage>
```
There's a lot to pack but we will explain what's going on here.

First, to start with the "parent node", which is the <syntax lang="xml">&lt;stage&gt;</syntax> node, that is where stage options are being defined.<br>
```xml
<stage zoom="0.9" name="stage" folder="stages/default/" startCamPosY="600" startCamPosX="1000">
```
Noting options that you can set there:
- ``zoom`` which controls the default zoom of the stage.
- ``name``, name of the stage when you look for it in the Chart Editor.
- ``folder`` which changes the destination of where the sprites are taken from *(like ``images/stages/default/``)*.
- ``startCamPosX, startCamPosY`` set the destination of where the camera starts from *(before countdown)*

As for the other nodes, there's about *7 types* of them *(and more if you script them in, see <a href="../scripting/playstate-scripts/character-stage-scripts.md">Character/Stage Scripts</a>)*, we'll go through each of them.

*(note that it's important which order you put them in because they will take the same order in-game too)*

## <h2 id="sprite-node" sidebar="Sprite node">Sprite node (<syntax lang="xml">&lt;sprite&gt;</syntax>, <syntax lang="xml">&lt;spr&gt;</syntax>, <syntax lang="xml">&lt;sparrow&gt;</syntax>)</h2>
The sprite node defines the basic sprites in a stage.

```xml
<sprite name="bg" x="-600" y="-200" sprite="stageback" scroll="0.9"/>
```
The options are:
- ``name`` which defines the internal name used for scripting.
- ``x`` and ``y`` define it's position in-game.
- ``sprite`` is the name of the sprite in the files. *(keep in mind if you set this to point to a sparrow spritesheet it will automatically make an animation of all the frames in the spritesheet)*
- ``scroll``, ``scrollx`` and ``scrolly`` determine the scrollFactor of the sprite *(how much it moves with the camera)*

Other options include:
- ``skewx`` and ``skewy`` skews the sprite.
- ``antialiasing`` determines whether or not the sprite has antialiasing. *(true by default)*
- ``width`` and ``height`` determine the width and height of the sprite's hitbox. *(does not affect the sprite itself)*
- ``scale``, ``scalex`` and ``scaley`` are size multipliers for the sprite's width and height. *(setting it to 2 means double the size)*
- ``graphicSize``, ``graphicSizex`` and ``graphicSizey`` determine the width and height of the sprite.
- ``updateHitbox`` determines whether or not to update the sprite's hitbox.
- ``zoomFactor`` defines how much the sprite should scale with the camera's zoom. *(setting it to 0 will make it stay to the original size no matter what)*
- ``alpha`` is the "opacity" of the sprite
- ``color`` tints the sprite in the color you set it to *(example <code class="hljs-string">#FF0000</code> will tint the sprite in full red)*
- ``playOnCountdown`` tells the sprite whether or not to play it's animation during countdown or not.
- ``beatOffset`` offsets which beat to play the sprite animation
- ``beatInterval`` sets sprite's animation to play at a beat interval *(basically the amount of beats to skip + 1)*

You can also define animations by giving it a child node called <syntax lang="xml">&lt;anim&gt;</syntax>. A sprite node with an animation node looks something like this:
```xml
<sprite name="dancer1" sprite="limoDancer" type="beat">
    <anim name="danceLeft" anim="bg dancer sketch PINK" loop="false"/>
    <anim name="danceRight" anim="bg dancer sketch PINK" loop="false"/>
</sprite>
```
An <syntax lang="xml">&lt;anim&gt;</syntax> node can define these options:
- ``name`` defines the internal name of the animation *(used for scripting)*
- ``anim`` is the prefix for finding the animation in the spritesheet.
- ``indices`` indicates which frames to play from the previously found frames. (For a range you can type <code class="hljs-string">1..5</code> to generate <code class="hljs-string">1,2,3,4,5</code>)
- ``type`` determines the type of the animation. either <code class="hljs-string">beat</code> or <code class="hljs-string">loop</code>.
- ``fps`` is the framerate of your animation.
- ``x`` and ``y`` are the animation offset. *(offset is only applied when the animation is played)*
- ``forced`` whether or not to force animation playback while a different one is already playing.
- ``loop`` to make your animation loop.

Defining advanced properties is also possible. Like this:
```xml
<sprite name="clouds" sprite="clouds">
    <property name="moves" type="bool" value="true">
    <property name="velocity.x" type="float" value="40.0">
</sprite>
```

## <h2 id="solid-node" sidebar="Solid node">Solid node (<syntax lang="xml">&lt;solid&gt;</syntax>, <syntax lang="xml">&lt;box&gt;</syntax>)</h2>
Solid nodes are sprites that is, unlike a Sprite Node, composed of only one select color. This node has less parameters since it doesn't use images. <br>
Creating one of these looks something like this:

```xml
<solid name="void" color="#FFFFFF" width="1280" height="720">
```
*(there's a difference between using <syntax lang="xml">&lt;solid&gt;</syntax> and <syntax lang="xml">&lt;box&gt;</syntax>, while <syntax lang="xml">&lt;solid&gt;</syntax> offers more performance, it might break with shaders and other stuff, so if that happens, use <syntax lang="xml">&lt;box&gt;</syntax> instead)*

Accepted parameters:
- `name` internal name.
- `color` which colors the solid/box.
- `x` and `y` determine the position in the stage.
- `width` and `height` defines the size of the solid/box.

## <h2 id="character-node" sidebar="Character nodes">Character nodes (<syntax lang="xml">&lt;boyfriend&gt;</syntax>, <syntax lang="xml">&lt;bf&gt;</syntax>, <syntax lang="xml">&lt;player&gt;</syntax>, <syntax lang="xml">&lt;girlfriend&gt;</syntax>, <syntax lang="xml">&lt;gf&gt;</syntax>, <syntax lang="xml">&lt;dad&gt;</syntax>, <syntax lang="xml">&lt;opponent&gt;</syntax>, <syntax lang="xml">&lt;character&gt;</syntax>, <syntax lang="xml">&lt;char&gt;</syntax>)</h2>
Character nodes are used to position characters in the stage. A Character node looks something like this:
```xml
<boyfriend x="200" y="400"/>
```
Accepted parameters are:
- ``x`` and ``y`` for positioning.
- ``camxoffset`` and ``camyoffset`` for changing the character's camera point.
- ``skewx`` and ``skewy`` for skewing.
- ``alpha`` which determines the opacity of the character sprite.
- ``flip`` for if you want to flip the character for specifically for the stage.
- ``scroll``, ``scrollx`` and ``scrolly`` to change the scrollFactor of the character.

For the <syntax lang="xml">&lt;character&gt;</syntax> and <syntax lang="xml">&lt;char&gt;</syntax> nodes only use them if you want to change a specific character *(ex. if you want to change pico's positions)*

```xml
<character name="pico" x="400" y="200">
```

Keep in mind that where you put these nodes is important as the character will be layered depending on that.
```xml
<boyfriend/>
<sprite name="stageCurtains" x="-500" y="-300" sprite="stagecurtains" scroll="1.3"/>
```
*(this will put boyfriend behind the <code class="hljs-string">stageCurtains</code> sprite)*

## <h2 id="ratings-node" sidebar="Rating sprites node">Ratings sprites node (<syntax lang="xml">&lt;ratings&gt;</syntax>, <syntax lang="xml">&lt;combo&gt;</syntax>)</h2>
This node is only used to position the rating sprites and does nothing else *(atm)*. Positioning in nodes doesn't matter here.
```xml
<ratings x="200" y="400">
```
The only parameters are ``x`` and ``y``.

## <h2 id="stage-extensions" sidebar="Stage Extensions">Stage Extensions (<syntax lang="xml">&lt;use-extension&gt;</syntax>, <syntax lang="xml">&lt;extension&gt;</syntax>, <syntax lang="xml">&lt;ext&gt;</syntax>)</h2>

```xml
<use-extension script="example" />
<extension script="example" />
<ext script="example" />

<ext script="example" folder="data/scripts/" isShortLived="true" importStageSprites="true" loadBefore="false" />
```

Accepted parameters:
- ``script`` which is the name of the script to load.
- ``folder`` which is the folder to load the script from. (defaults to <code class="hljs-string">"data/scripts/"</code>)
- ``isShortLived`` which determines whether or not the script is destroyed after the stage has finished loading. (defaults to <code class="hljs-string">false</code>)
- ``importStageSprites`` which determines whether or not to import the stage sprites into the script. (defaults to <code class="hljs-string">false</code>)
- ``loadBefore`` which determines whether or not to load the script before going through the other stage's nodes, exactly like the default stage's script allowing for example to call <code class="hljs-title">onStageXMLParsed</code>. If instead you want the script to load after a certain node or such, set this to <code class="hljs-string">false</code>. (defaults to <code class="hljs-string">true</code>)

All of these attributes above get stored inside a list, singular Imported XML scripts can access their infos easily through a variable called ``scriptInfo`` (this variable uses a <syntax lang="haxe">XMLImportedScriptInfo</syntax> class and it's automatically imported into these scripts).

This allows you to load custom scripts for your stages, that allow for adding custom stage nodes, or whatever else you can think of.

Check out the <a href="./stage-extensions.md">Stage Extensions</a> page for more information.
