---
desc: This page explains how to use 3D rendering in your mod!
lastUpdated: 2025-09-08T20:53:00.000Z
title: 3D rendering
---
# 3D rendering

In Codename Engine, there is Away3D integration with a few tools to make the process easier for you.

Here's a simple way to add a Cube primitive into your scene.
Just take this method and apply it to a stage or something, and you'll get your cube. Though you'll need to do more work to get the cameras and their perspectives to line up correctly. a sugge
```haxe
import flx3d.Flx3DView;

import away3d.entities.Mesh;
import away3d.primitives.CubeGeometry;

function create() {
    cube = new Mesh(new CubeGeometry()); // This is your Cube
    cube.z -= 200; // Move it back a bit so you can see it on the camera
	cube.rotationY = 23; // Add some rotation so you can see it's 3D
	cube.rotationX = 45;

    scene3D = new Flx3DView(0, 0, FlxG.width, FlxG.height); // This is what's creating the 3D world
	scene3D.screenCenter();
    scene3D.addChild(cube);

    add(scene3D); // The 3D View works just like any other sprite so it will have to be added like one
}
```

## Temporary information (clean up later)

From now on, assume that `scene3D` is set up like this
```haxe
scene3D = new Flx3DView(0, 0, FlxG.width, FlxG.height);
```

Here's just a few function I found that I think would be useful to know about

```haxe
scene3D.addModel(assetPath:String, callback:Asset3DEvent->Void, ?texturePath:String, smoothTexture:Bool = true);

scene3D.addChild(childObject);
```
