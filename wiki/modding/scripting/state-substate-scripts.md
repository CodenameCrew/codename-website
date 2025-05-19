---
author: Frakits
desc: This page explains how to modify the engine's states and substates
lastUpdated: 2024-09-05T18:39:28.000Z
title: State/Substate Scripts
---
# State/Substate Scripts
State/Substate Scripts are scripts that can change any state or substate of the game.<br>
You can change the Main Menu, the Freeplay Menu and even the Chart Editor.

## <h2 id="modify-existing-states" sidebar="Modifying Existing States">Modifying a pre-existing State/Substate</h2>

To get started, make a Script in ``./data/states`` and name it corresponding to the state/substate you want to change.

For example, if you decide to change the Main Menu, make a Script like this ``./data/states/MainMenuState.hx``<br>
A basic Main Menu modification looks like this:
```haxe
function postCreate() {
    forceCenterX = false; // disable the code that centers the menu buttons.
    for (i=>button in menuItems.members) {
        button.x += Math.sin(i) * 300; // move buttons
    }
}
```
This code results in the menu looking like this.

<img src="./State or Substate Scripts.png" alt="Image showing the menu buttons being moved"/>

You can do this with every State/Substate of course, but keep in mind you have to study the state's code first before modifying it. *(you can find the code in <a href="https://github.com/CodenameCrew/CodenameEngine">Codename Engine's Repository</a>)*<br>
*Also look for <a href="./script-calls.md">All of the script calls</a> for menu script calls*

## <h2 id="create-custom-states" sidebar="Creating Custom States">Creating custom States/Substates</h2>

You can also create entirely custom ones too! By putting them in the same ``./data/states/`` folder, you create new ModStates/ModSubstates.

Accessing them is done via this piece of code:
```haxe
FlxG.switchState(new ModState("MyCustomState")); // assuming we have made a new Script ./data/states/MyCustomState.hx
```
or this code
```haxe
openSubState(new ModSubState("MyCustomSubstate")) // assuming we have made a new Script ./data/states/MyCustomSubstate.hx
```
