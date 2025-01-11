---
author: BerGP
desc: This page explains how to use Custom Transitions
lastUpdated: 2025-01-11T05:57:34.343Z
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

You can mod the transition in any way you'd like. For example, overriding the transition for your own is as simple as:
```haxe
function create(event) {
		event.cancel();

		// your code here
}
```
*(This event has more parameters, and there exists other calls. Check the <a href="script-calls.md">All Script Calls Page</a>, to learn more)*

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