# JSC's Mumu's Adventures 🕹️

![Mumu's Adventures](/src/public/mumu-adventures.png)

Live your life as Mumu, the heroic adventurer, to defeat the evil Maginta Llennaspom.

You can play the current version [here](https://mumu.rochefolle.net).

# Current status

The game is under heavy development. It is a new rewrite, without using the original code that what based on Phaser. The code is much simpler, plain TypeScript with no dependencies. It will also allow for Unit Testing to bring quality to the codebase.

## Release 0.0.1-beta

The game only supports desktop.
The game only allows to navigate between 2 maps.

# Credits

- This game is a TypeScript adaptation of the [Create a Legend of Zelda Style Game with Javascript](https://www.youtube.com/watch?v=zogxGGDJ2Ok) course from [Chris Courses](https://www.youtube.com/@ChrisCourses)
- The maps are created using [Tiled](https://www.mapeditor.org/) map editor. The maps are converted to simpler JSON array in a TypeScript format using the command `yarn genmap <level>/<number>/map.tmj`. See [Generating Map files](docs/assets.md#conversion).
- The tilesets are from [Pixel Boy's Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) assets pack.
- Some characters sprites are using [Lumi's cute female npcs](https://lumi-li.itch.io/cute-16x16-female-npcs). The sprite is split to individual files using `yarn splitsprite <path_to_file.png>`. I might improve the code later to refer to coordinate in a sprite file with all characters.
