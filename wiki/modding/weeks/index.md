---
author: BerGP
desc: How to make custom weeks
title: Weeks
lastUpdated: 2025-02-08T19:55:06.777Z
---
# Creating Weeks
Weeks have to be created manually currently, sorry.

## <h2 id="week-xml" sidebar="Week.xml">The XML</h2>

Make the xml under ``./data/weeks/weeks/``. Now now, this whole "week xml" thing sounds complicated but trust me, it's not that hard.
```xml
<week name="PICO" chars="pico,bf,gf" sprite="week3">
	<song>Pico</song>
	<song>Philly Nice</song>
	<song>Blammed</song>
</week>
```
The Week XML above is from Week 3. It does kinda show you how to get going, but it deserves a explaination.

Let's start with the "parent node", it's <syntax lang="xml">&lt;week&gt;</syntax>! That's where the options for the week are defined.
```xml
<week name="PICO" chars="pico,bf,gf" sprite="week3">
```

So far, possible options to set there are:
- ``name``, which updates the title text for the week (usually on the top right in the Story Mode menu)
- ``chars``, which controls what characters are shown when selecting the week *(in the order of ``opponent,boyfriend,girlfriend``, no spaces)*.
- ``sprite``, which tells the engine what image to use for the week button *(has to be at ``menus/storymenu/weeks/``)*. When excluded, the xml filename will be used.

## <h2 id="week-sorting" sidebar="Organizing Weeks">weeks.txt</h2>

There's an optional text file you can use to sort the weeks. It goes under ``./data/weeks/``.
<br>All you gotta do to order the weeks is just type their file names in the order you'd like:
```
week4
week2
week6
```
This example would order the weeks as Week 4 going first, Week 2 going second and Week 6 being last.

Commentary is possible by typing a pound sign (``#``) before it.

Phew, that was.. wordy... Wait, I almost forgot to explain the other nodes! Let's just get to them.

## <h2 id="week-song-node" sidebar="Song Node">Song Node (<syntax lang="xml">&lt;song&gt;</syntax>)</h2>

Finally, our song! To make it appear, type it in the following format:
```xml
<song>song-name</song>
```
The example above would make there be a ``song-name`` named song under the songs list.

*(note that order is important, cause it'll follow in-game)*

## <h2 id="week-diff-node" sidebar="Week Difficulties">Difficulty Node (<syntax lang="xml">&lt;difficulty&gt;</syntax>)</h3>

Lastly, you can specify which difficulties your week will have. It's as simple as making a difficulty node for each difficulty:
```xml
<difficulty name="Easy"/>
<difficulty name="Normal"/>
<difficulty name="Hard"/>
<difficulty name="Erect"/>
<difficulty name="Nightmare"/>
```
This would make the week have ``easy``, ``normal``, ``hard``, ``erect`` and ``nightmare`` as difficulty options.

Don't know if you noticed but yeah, custom difficulties are supported. Just remember to have their image at ``menus/storymenu/difficulties/`` with the name of it in lowercase *(``menus/storymenu/difficulties/erect`` for example)*.