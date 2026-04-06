---
author: OfficialCB
desc: This page explains how to use 3D rendering in your mod!
lastUpdated: 2026-03-03T20:36:15.789Z
title: 3D rendering
---
# 3D rendering

In Codename Engine, there is Away3D integration with a few tools to make the process easier for you.

If you want to read up on Away3D and how it works, I recommend looking at it's [Github Repository](https://github.com/openfl/away3d) or looking at the [Documentation](http://away3d.com/documentation/).

## Working with primitives

Primitives are built-in meshes that are simple in nature.  
Examples of primitives are Cubes, Planes, or Spheres.

Here's an example of adding a Cube Primitive to your scene.
```haxe
import flx3d.Flx3DView;

import away3d.entities.Mesh;
import away3d.primitives.CubeGeometry;

function create() {
    cube = new Mesh(new CubeGeometry()); // This is your Cube

    cube.scale(2); // Make it double the size, just to see it better

	cube.rotationY = 23; // Add some rotation so you can see it's 3D
	cube.rotationX = 45;

    scene3D = new Flx3DView(0, 0, FlxG.width, FlxG.height); // This is what's creating the 3D world
	scene3D.screenCenter();
    
    scene3D.addChild(cube); // This adds the cube to the scene

    add(scene3D); // The 3D View works just like any other sprite so it will have to be added like one
}
```

If you wanna add a texture to this primitive, you'll need to create a `TextureMaterial`.
Here's the same code as before, but we add a `TextureMaterial` to the cube.
```haxe
import flx3d.Flx3DView;

import away3d.entities.Mesh;
import away3d.primitives.CubeGeometry;

import away3d.utils.Cast;
import away3d.materials.TextureMaterial;

function create() {
    cube = new Mesh(new CubeGeometry()); // This is your Cube

    cube.material = new TextureMaterial(
        Cast.bitmapTexture(
            Assets.getBitmapData(Paths.image("path/to/texture"))
        ), 
        true, // This is "smooth" or "antialiasing" for the texture, setting this to false will make it pixelated
        false, // This is "repeat" and it's useful if you want your texture to tile over a large area, to make it tile, set it to true
        true // This is "mipmap" which pretty much makes your texture become less detailed the further away it is
    );

    cube.scale(2); // Make it double the size, just to see it better

	cube.rotationY = 23; // Add some rotation so you can see it's 3D
	cube.rotationX = 45;

    scene3D = new Flx3DView(0, 0, FlxG.width, FlxG.height); // This is what's creating the 3D world
	scene3D.screenCenter();
    
    scene3D.addChild(cube); // This adds the cube to the scene

    add(scene3D); // The 3D View works just like any other sprite so it will have to be added like one
}
```

## Working with models

From now on, assume that `scene3D` is set up like this as I will not be writing out the entire script anymore.
```haxe
scene3D = new Flx3DView(0, 0, FlxG.width, FlxG.height);
```

Adding models is greatly simplified in Codename Engine compared to using Away3D normally.  
To add a model simply do the following.
```haxe
scene3D.addModel(
    Paths.obj("path/to/model"), // This is where it grabs the model from, I will go into more detail about this below

    function (model) {
        // This runs for every single asset inside of your model, including mesh, potential animators, and whatever else you could have going on

        // If you want to manipulate your model in any way, do it in here
    },

    Paths.image("path/to/texture"), // This is the texture of your model

    true // This is "smoothTexture" which determines if your texture will be filtered or if it should be pixelated
);
```

You can also set a variable to be your mesh this way.
```haxe
var coolModel;

scene3D.addModel(
    Paths.obj("path/to/model"),

    function (model) {
        // This runs for every single asset inside of your model, including mesh, potential animators, and whatever else you could have going on

        if (Std.string(model.asset.assetType) == 'mesh') { // This is needed to specify that we're specifically interacting with the Mesh of the object instead of interacting with any animations or skeletons on accident
            coolModel = model.asset;
        }
    },

    Paths.image("path/to/texture"),

    true
);
```

In the examples above, I used `Paths.obj()` to grab the model, however, there are more model types that are supported, some of which have more features.

The list of supported formats are these:
- `obj`
- `dae`
- `md2`
- `md5`
- `awd`

The `AWD` format is specific to Away3D's Away Builder.
Away Builder is a program designed to simplify a lot of complex work with importing models and animations into your project.
However, since Away Builder is so old, it is now mainly depricated and doesn't really work with most modern software.
Instead, you are often required to use the `md5mesh` and `md5anim` formats, which do not exist in most programs today.
There are however workarounds, as older versions of Blender have [addons](https://github.com/KozGit/Blender-2.8-MD5-import-export-addon) to let you export to these formats.


I will not go through how to use Away Builder here as it is not specific to Codename Engine.

The `AWD` format is useful as it allows you to package models, animations, and more into one asset which all get loaded together automatically.

***TODO: Go into more detail about the pros and cons of each formats listed above***

## Animating your models

To animate your models, I recommend using the `AWD` format alongside Away Builder since it simplifies the process of setting up the animators.

However, some precautions about Away3D.
It's animation is quite limited and doesn't allow for animations changing size or position, only rotation is available.

Once you have your model and animations exported from Away Builder, you'll want to set it up something like this:
```haxe
var coolModel;

var coolAnimator;

scene3D.addModel(
    Paths.obj("path/to/model"),

    function (model) {
        // This runs for every single asset inside of your model, including mesh, potential animators, and whatever else you could have going on

        if (Std.string(model.asset.assetType) == 'mesh') { // This is so we only interact with the Mesh
            coolModel = model.asset;
        }

        if (Std.string(model.asset.assetType) == 'animator') { // To only interact with the Animator
            coolAnimator = model.asset;

            animatorLoaded();
            
            // FYI, you can play the animation directly in here if you want, I just keep them separate for demonstration purposes
            // model.asset.play("animationName");
        }
    },

    Paths.image("path/to/texture"),

    true
);

function animatorLoaded() {
    coolAnimator.play("animationName");
}
```

Once you have your animator, you can simply call it's `play("animName")` function whenever you wanna play an animation.

## TODO: Add info about lighting and other stuff
