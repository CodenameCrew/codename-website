---
author: Ne_Eo & Frakits & Lily Ross (mcagabe19)
desc: This page explains how to add custom shaders
lastUpdated: 2024-11-21T21:28:09.603Z
title: Shaders
---
# Shaders
Shaders are pretty easy to do due to our shader backend that does the hard work for us. All you have to do is make a file in ``./shaders/``. Our system supports both fragment and vertex shaders to change both pixels and vertices. *(for example ``./shaders/example.frag`` and ``./shaders/example.vert``)*

To use them, you have to script them in *(obviously)*. To do so, look at these pieces of code.
```haxe
camHUD.addShader(new CustomShader("example")); //adds a shader onto the camera.

FlxG.camera.addShader(new CustomShader("example")); //ditto but on FlxG.camera.

FlxG.game.addShader(new CustomShader("example")); //adds a shader onto the entire game (persists between states).

sprite.shader = new CustomShader("example"); // sets a sprite's shader to a shader. (only one shader can be added per sprite)

boyfriend.shader = new CustomShader("example"); // ditto but on characters.
```
If your shader contains uniform variables that needs to be set, you can do so like this:
```haxe
var shader = new CustomShader("example");
shader.intensity = 0.4;
camGame.addShader(shader);
```

## Remember that we only support flixel/openfl shaders.
A basic shader looks like this:
```glsl
#pragma header //important to prevent your game from crashing
void main() {
    vec2 uv = openfl_TextureCoordv;

    vec4 col = flixel_texture2D(bitmap, uv);

    gl_FragColor = col;
}
```

If you got a shader from a site called [ShaderToy](https://shadertoy.com), you have to manually convert them to flixel/openfl accepted format.

Here's a sample shader that renders a basic texture.
```glsl
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    // Time varying pixel color
    vec4 col = texture(iChannel0, uv);
    // Output to screen
    fragColor = col;
}
```
We'll show each step to converting this shader into an usable openfl/flixel shader.

<!-- I could use <syntax lang="glsl"> but it looks weird af -->

1. replace ``void mainImage( out vec4 fragColor, in vec2 fragCoord )`` with a simple ``void main()`` *(flixel and openfl do not have any parameters since the coords are defined outside the function)*
2. replace ``vec2 uv = fragCoord/iResolution.xy;`` with ``vec2 uv = openfl_TextureCoordv`` *(or in some cases, add ``vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize.xy`` before it and replace `iResolution.xy` with ``openfl_TextureSize.xy`` (if the uv value is different than usual))*
3. replace ``vec4 col = texture(iChannel0, uv);`` with ``vec4 col = texture2D(bitmap, uv);`` or ``vec4 col = flixel_texture2D(bitmap, uv);`` *(keep in mind bitmap is the pixels of the camera/sprite the shader is applied to)*
4. finally, replace ``fragColor = col;`` with ``gl_FragColor = col;``

### Keep in mind that this covers the most basic on how to convert a shader from shadertoy.com, complex shaders will need more expertise with handling shaders before converting those.

## <h2 id="shader-compatibility" sidebar="Shader Compatibility">Important things to note if your shader doesn't work for certain people.</h2>
Avoid using `0.` or `.0` for floats, instead, use `0.0` (ending the float number with an `.0`)
*(despite half floats working on nVidia gpus, other gpus like AMD gpus don't support this feature)*

Avoid using switch cases, and use if statements where possible.
*(switch cases are not supported on macOS or miscellaneous platforms)*

Ints are not recommended when initiating vectors. *(ex, vec2(1, 1) is not supported on certain platforms, use vec2(1.0, 1.0) instead)*.
Instead, use floats where it's expected. Like mod(1.0, 2.0) instead of mod(1, 2)

Avoid using the following types:
- `ivec2`, `ivec3`, `ivec4`
- `bvec2`, `bvec3`, `bvec4`
- `uvec2`, `uvec3`, `uvec4`
- `uint`

as they are unsupported on certain platforms.

Avoid using `gl_` at the start of your variables *(ex, `float gl_Number` can break your shaders)*.

Setting defaults on uniforms is not recommended, since its not supported on all platforms, so please set the defaults in your shader constructor or after initializing the shader.

Avoid using `<number>u` *(ex, 8u)*

Avoid initializing variables with the name `input` or `sample`, as those cause the shader to stop working on AMD gpus or other platforms.

Avoid using the % (modulo) operator and instead use the mod function.

Avoid using arrays. Since some platforms don't support them.

## Important: Runtime Initialization of Globals

In OpenGL ES (such as on mobile and web), global variables declared without a storage qualifier (const, uniform, or varying) must be initialized with constant expressions at compile time. This means you cannot assign runtime-dependent values like openfl_TextureCoordv.xy or openfl_TextureSize directly to global variables outside a function.

For example:

```glsl
// INVALID: Global initialization with runtime values
vec2 uv = openfl_TextureCoordv.xy;  // ERROR: Non-constant initialization
vec2 fragCoord = openfl_TextureCoordv * openfl_TextureSize;  // ERROR: Non-constant initialization
vec2 iResolution = openfl_TextureSize;  // ERROR: Non-constant initialization
```

This happens because variables like openfl_TextureCoordv and openfl_TextureSize are populated dynamically by the GPU during the shader's execution and are not available at compile time.

To fix this, move such assignments into the main() function or any local scope where runtime data is valid:

```glsl
// VALID: Runtime initialization inside a function
void main() {
    vec2 uv = openfl_TextureCoordv.xy;
    vec2 iResolution = openfl_TextureSize; 
    vec2 fragCoord = uv * iResolution;

    vec4 col = flixel_texture2D(bitmap, uv);

    gl_FragColor = col;
}
```

This adjustment ensures the shader complies with GLSL rules and works correctly across all platforms.

