---
author: BerGP
desc: How to get songs showing in game
title: Displaying Songs
lastUpdated: 2025-02-08T23:45:46.603Z
---
# Displaying Songs

## <h2 id="week-song" sidebar="On a Week">Week Song</h2>

Simply add a <syntax lang="xml">&lt;song&gt;</syntax> node to your week xml, containing the song name.

```xml
<song>song-name</song>
```

*(if you wanna learn more about week xmls, consider taking a <a href="../weeks/index.md">read into it</a>)*

## <h2 id="freeplay-song" sidebar="Freeplay Only">Freeplay Exclusive</h2>

Or if you prefer not to use weeks, just <a href="index.html#creating-the-song-itself">create your song normally</a> and it'll automatically appear in freeplay.

And optionally, you can make use of ``./data/freeplatSonglist.txt``, it follows a similar format to <a href="../weeks/index.html#week-sorting">``./data/weeks/weeks.txt``</a>.
```
song-name
other-song

hot-milk
# This is a comment
```
It serves to tell Freeplay what songs to show and in what order.

You can add comments to the list by using a pound sign (``#``) at the start of the line.
