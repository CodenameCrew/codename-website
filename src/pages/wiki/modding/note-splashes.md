---
author: Microkat (KadePleaseHelpMe)
desc: How to make custom note splashes.
lastUpdated: 2024-10-13T17:46:45.182Z
title: Note splashes
---

# CUSTOM NOTE SPLASHES

For starters, you need your spritesheet (located in ``assets/images/game/splashes/...``).
Here's an example:
![custom-splashes_spritesheet](https://github.com/user-attachments/assets/e8353358-c1d1-4b0b-9ba3-ee3f49e9bd0f)

Secondly, you need a .xml file to store the data of the note splash (located in ``assets/data/splashes/...``).
Example: 
```xml
<!DOCTYPE codename-engine-splashes>
<splashes sprite="game/splashes/sploosh" alpha="0.6">
	<strum id="0"> <!-- LEFT -->
		<anim name="splash purple" anim="sploosh left" fps="24" x="0" y="0" />
	</strum>
	<strum id="1"> <!-- DOWN -->
		<anim name="splash blue" anim="sploosh down" fps="24" x="0" y="0" />
	</strum>
	<strum id="2"> <!-- UP -->
		<anim name="splash green" anim="sploosh up" fps="24" x="0" y="0" />
	</strum>
	<strum id="3"> <!-- RIGHT -->
		<anim name="splash red" anim="sploosh right" fps="24" x="0" y="0" />
	</strum>
</splashes>
```

The essential nodes for the data .xml are the <syntax lang="xml">&lt;splashes&gt;</syntax>, the <syntax lang="xml">&lt;strum&gt;</syntax>, and the <syntax lang="xml">&lt;anim&gt;</syntax>.

The <syntax lang="xml">&lt;splashes&gt;</syntax> node has four main parameters:
- ``Sprite``: The spritesheet applied to the note splashes (starting from ``assets/images/...``).
- ``Alpha``: The visibility of the splash, with 1 being completely solid and 0 being useless because it just makes the splash transparent.
- ``Antialiasing``: Whether or not the sprite gets antialiasing applied (you know what antialiasing is).
- ``Scale``: The scale of the splashes' pixels (so if you made your splashes too damn big, you don't have to remake the whole spritesheet).

The <syntax lang="xml">&lt;strum&gt;</syntax> node has one important parameter:
- ``Id``: The ID of the splash you're making data for from left to right (left = 0, down = 1, etc.).

Finally, the <syntax lang="xml">&lt;anim&gt;</syntax> nodes have a few necessary parameters:
- ``Name``: This is the name of the animation that you're editing in the data
- ``Anim``: This is the name of the animation that you're editing in the spritesheet .xml file.
- ``FPS``: The FPS of the animation. Fairly self explanatory.
- ``X``: This is the X offset of your notesplash in case it's not properly centered on the arrows.
- ``Y``: Ditto but the Y offset.

Now for the fun part: Applying your custom note splashes to a song!

Changing note splashes is really easy. All that's needed is a .hx script in your ``mysong/scripts/...`` folder with something like this in it:
```haxe
function onPlayerHit(e)
{
	e.note.splash = "sploosh";
}
```
[weed]: <> (I had to figure this out by backtracking through playstate and looking through 7 different source files)

Once you run your game and open your song, you should find that you now have...
### CUSTOM NOTE SPLASHES!

![custom_splashes](https://github.com/user-attachments/assets/f0a553bd-99c7-41cb-b92f-2df3e34ee389)
