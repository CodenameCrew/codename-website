---
author: TheZoroForce240
desc: This page explains how to create custom controls for your mod!
lastUpdated: 2025-08-05T18:51:29.793Z
title: Custom Controls
---
# Custom Controls
Custom controls can be easily added to your own mod and automatically setup inside the controls menu! (so you don't have to code it yourself)

To get started, put a file in `./data/config` called `controls.xml`.

Here is an example xml that you can copy from:

```xml
<controls>
	<category name="TEST CATEGORY">
		<control name="dodge" saveName="dodge" menuName="DODGE" keyP1="SPACE" keyP2=""/>
	</category>
	<category name="SIX KEY">
		<control name="6k0" saveName="control_6k0" menuName="LEFT" keyP1="S" keyP2="" menuIcon="game/notes/default" menuAnim="purple0"/>
		<control name="6k1" saveName="control_6k1" menuName="UP" keyP1="D" keyP2="" menuIcon="game/notes/default" menuAnim="green0"/>
		<control name="6k2" saveName="control_6k2" menuName="RIGHT" keyP1="F" keyP2="" menuIcon="game/notes/default" menuAnim="red0"/>
		<control name="6k3" saveName="control_6k3" menuName="LEFT" keyP1="J" keyP2="LEFT" menuIcon="game/notes/default" menuAnim="purple0"/>
		<control name="6k4" saveName="control_6k4" menuName="DOWN" keyP1="K" keyP2="DOWN" menuIcon="game/notes/default" menuAnim="blue0"/>
		<control name="6k5" saveName="control_6k5" menuName="RIGHT" keyP1="L" keyP2="RIGHT" menuIcon="game/notes/default" menuAnim="red0"/>
	</category>
</controls>
```

<img src="./Custom Controls.png" alt="Image showing the custom controls based on the example above"/>

You want to start by creating a <syntax lang="xml">&lt;category&gt;</syntax> node, which will include any options inside that section while in the menu (as shown in the screenshot)

The <syntax lang="xml">&lt;category&gt;</syntax> only has one available property:
- `name` - This is the name that will appear for the category in the controls menu

Each <syntax lang="xml">&lt;control&gt;</syntax> node can then be added as a subnode of the category

## <h2 id="properties" sidebar="Properties">Here's the list of properties for each control:</h2>

- `name` - This name is what will be used to access the control later
- `saveName` - This is the name used with `FlxG.save.data` for the control to be stored in, make sure to name this carefully and not break any other save data!
- `menuName` - This is the name that will be displayed inside the menu
- `keyP1`, `keyP2` - These are what the control key binding will default to, this name will need to be matching with a `FlxKey` name to correctly set, and can be set to `""` to default to none. The `P1` and `P2` determine which player uses the binding in co-op mode (when checking `.controls` on the `StrumLine`) or when checking directly through `controlsP1` or `controlsP2`, and will act as 2 bindings by default just like any other control.
- `menuIcon` - This is an image path to a custom control icon that can be used in the menu, must be a sparrow xml spritesheet! (optional)
- `menuAnim` - This is the animation prefix for the spritesheet set by `menuIcon` (optional, but required if using `menuIcon`)

Accessing in scripts:

The control state can be checked multiple ways, typically just by calling `controls` (assuming that you're in a `MusicBeatState`), and then calling the member functions `getJustPressed(name)`, `getJustReleased(name)`, or `getPressed(name)`.

Per player controls can be accessed with `controlsP1` and `controlsP2`, and per strumline controls can be accessed with `.controls` on any `StrumLine` (example: `strumLines.members[0].controls`), which will change between `P1`/`P2` controls when using co-op mode (only while in `PlayState`).

Example usage of accessing a control inside of a script:

```haxe
function update(elapsed) {
    //global
    if (controls.getJustPressed("dodge")) {
        trace("dodge!");
    }
    if (controls.getJustReleased("dodge")) {
        trace("released dodge!");
    }
    if (controls.getPressed("dodge")) {
        trace("holding dodge!");
    }

    //per player
    if (controlsP1.getJustPressed("dodge")) {
        trace("p1 dodge!");
    }
    if (controlsP2.getJustPressed("dodge")) {
        trace("p2 dodge!");
    }

    //per strumline (changes on co-op mode)
    if (strumLines.members[0].controls.getJustPressed("dodge")) {
        trace("strumline0 dodge!");
    }
    if (strumLines.members[1].controls.getJustPressed("dodge")) {
        trace("strumline1 dodge!");
    }
}
```

## Multikey Control Bindings

You may notice that if you change a strumline's key count the bindings will not work by default.

This can be easily solved by setting up controls in a specific way inside the controls xml.

All you need to do is have the `name` property of the controls to be set to `keyCount`k`strumID` for each one, for example `name="5k0"` will be for the first strum when the key count is 5.

If you've named it correctly you should have the bindings automatically set for that key count!
