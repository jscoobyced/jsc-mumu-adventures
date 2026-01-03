## Asset management

# Maps

## Creation

The maps are generated in [Tiled](https://www.mapeditor.org/) map editor. All the necessary files are in the `/assets/` folder:

- Tilesets:
- Decorations.tsx: all decorations (trees, houses, plants, furnitures...)
- Terrain.tsx: grass, mud, paths, water...
- Levels maps
- They are organized in a chess like reference system: A1 is the top-left map, A2 is the next map on its right, B1 is the next one below A1
- The file `src/code/levels/index.ts` is used to configure the relationships between levels
- Make sure you export the maps from Tiled application using the JSON format

Note the terrain image was modified to add path/grass borders missing in the original tileset.

## Conversion

To convert a .tmj file, navigate to the `src` folder and run the command:

```
yarn genmap A/1/map.tmj
```

This will create (or replace) the files in `src/code/levels/A/1/`. It will create a TypeScript file for each tileset in the map.
You might need to adjust the `src/code/levels/A/1/index.ts` to add or remove some tilesets. Refer to the [Create a Legend of Zelda Style Game with Javascript](https://www.youtube.com/watch?v=zogxGGDJ2Ok) course to understand the different layers.
