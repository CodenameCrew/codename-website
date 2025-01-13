---
author: BerGP
desc: This page explains how to use Custom Transitions
lastUpdated: 2025-01-13T01:18:53.593Z
title: Custom Transitions
---
# Custom Transitions

## <h2 id="transition-scripts" sidebar="Transition Scripting">Custom State Transitions</h2>

Transition scripts allow for making your own transition, or modifying the existing one, all without source coding a bit.<br>
To do so, you must load it from a Script *(anyone really)*.
```haxe	
MusicBeatTransition.script = 'data/scripts/customTransition';
```
This snippet would load from ``.data/scripts`` looking for the ``customTransition.hx`` script.

You can mod the transition in any way you'd like. For example, making the transition go left to right:
```haxe
function postCreate(event) {
	transitionTween.cancel(); // Disabling original tween

	// Rotating Sprites
	transitionSprite.angle = event.transOut ? -90 : 90;
	transitionSprite.setGraphicSize(transitionCamera.height, transitionCamera.width); transitionSprite.updateHitbox(); // Once with switched angle, proportions need to go along
	transitionSprite.screenCenter();
	blackSpr.setPosition(event.transOut ? -transitionCamera.width : transitionCamera.width, 0); // Doing X instead of Y tween
	// Updating camera direction to change X instead of Y		
	transitionCamera.flipY = false;
	transitionCamera.flipX = !event.transOut;
	transitionCamera.scroll.set(transitionCamera.width);

	transitionTween = FlxTween.tween(transitionCamera.scroll, {x: -transitionCamera.width}, 2/3, {ease: FlxEase.sineOut, onComplete: (_) -> finish()});
}
```
Or even, cancelling the base one for one of your own:
```haxe
function create(event) {
	event.cancel();

	// your code here
}
```
It's all up to preference.

*(Note: ``event`` has more parameters, and there exists other calls. Check <a href="script-calls.md">All Script Calls</a>, to learn more)*

## <h2 id="skipping-transitions" sidebar="Skipping Transitions, No Good">Transition Skipping</h2>

In Codename Engine, you can skip transitions by holding SHIFT.<br>
But that wouldn't be so cool with *your* hard-worked transition, would it?

To prevent that from happening, disable ``allowSkip``
```haxe
function create(event) {
	allowSkip = false;

	// transition code below
}
```