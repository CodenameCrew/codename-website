---
author: Microkat (KadePleaseHelpMe)
desc: How to make custom note splashes.
lastUpdated: 2024-10-12, 21:54:27 EDT
title: Note splashes
---
Apparently nobody else is taking this task so I guess I'll do it

# WELCOME TO CUSTOM NOTE SPLASHES !!!!1!

First thing's first, you need your .png and your .xml files (located in assets/images/game/splashes/...)
Here's an example:
![Screenshot 2024-10-12 202850](https://github.com/user-attachments/assets/1d07e462-a622-49d7-bcd6-fb5862770e3e)
![Screenshot 2024-10-12 202844](https://github.com/user-attachments/assets/ea54cfae-d007-4c63-a879-50a8bfc15026)

What you name the subtextures doesn't matter because of...

### STEP 2 !!111!!1!1 !! !
Next, you need another .xml, but this time it's in assets/data/splashes instead of the image path
Example: 
![image](https://github.com/user-attachments/assets/bec625f4-7ae1-469d-982f-47bb50ba4b86)

The essential variables for the data .xml are the ``splashes``, the ``strums``, and the ``anims``.
Splashes variables:
- ``Sprite``: The sprite that appears for the note splashes (starting from ``assets/images/...``).
- ``Alpha``: The visibility of the splash, with 1 being completely solid and 0 being useless because it just makes the splash transparent.
- ``Antialiasing``: ... What am I supposed to say? It's antialiasing.
- ``Scale``: The scale of the splashes' pixels (so if you made your splashes too damn big, you don't have to remake the whole spritesheet).
Strums variables:
- ``Id``: The ID of the splash you're making data for from left to right (left = 0, down = 1, etc.).
Anim variables:
- ``Name``: This is the name of the animation that you're editing in the data
- ``Anim``: This is the name of the animation that you're editing in the spritesheet .xml file.
- ``FPS``: (Do I really need to explain what FPS is an acronym for?)
- ``X``: This is the X offset of your notesplash in case it's not properly centered on the arrows.
- ``Y``: Ditto but it's the Y offset.

Now for the fun part...

### STEP 3 !1 ! 1 ! !!! !!!11! ! !1 1

Time to use your custom note splashes in the game! Changing note splashes is really easy.
Just put a .hx script in your mysong/scripts folder with something like this in it:
```haxe
function onPlayerHit(e)
{
	e.note.splash = "sploosh";
}
```
[weed]: <> (I had to figure this out by backtracking through playstate and looking through 7 different source files)
And bada bing bada boom you have...
(🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁)
Hold up why isn't it working
Oh I forgot width and height in my spritesheet oops
There fixed it
![image](https://github.com/user-attachments/assets/37569dd2-ebdc-43a7-a71e-6656cbdcf155)
And now...
(🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁)

### CUSTOM NOTE SPLASHES !! 1! 1 ! 1 1  ! !! !! !

![custom_splashes](https://github.com/user-attachments/assets/f0a553bd-99c7-41cb-b92f-2df3e34ee389)
