import * as fs from "fs";
import * as path from "path";

const findModulus = (flatData: number[], tilesets: any[]) => {
  const nonZeroValues = flatData.find((val: number) => val !== 0) || 1;
  for (let i = tilesets.length - 1; i > 0; i--) {
    if (tilesets[i].firstgid < nonZeroValues) return tilesets[i].firstgid - 1;
  }
  return Number.MAX_SAFE_INTEGER;
};

const processLayer = (layer: any, tilesets: any[], outputDir: string) => {
  if (!layer.data || !layer.name || !layer.width || !layer.height) return;
  const flatData = layer.data;
  const width = layer.width;
  const height = layer.height;
  const newData = [];
  const modulus = findModulus(flatData, tilesets);
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      if (layer.name === "Collisions") {
        row.push(flatData[i * width + j] === 0 ? 0 : 1);
        continue;
      }
      row.push(flatData[i * width + j] % modulus);
    }
    newData.push(row);
  }
  const outFileName = `l_${layer.name}.ts`;
  const outFilePath = path.join(outputDir, outFileName);
  const fileContent = `export const l_${layer.name} = ${JSON.stringify(
    newData,
    null,
    2,
  )};\n`;
  fs.writeFileSync(outFilePath, fileContent, "utf-8");
  console.log(`Generated: ${outFilePath}`);
};

// Get the .tmj file path from command line arguments
const [, , tmjFilePath] = process.argv;
if (!tmjFilePath) {
  console.error("Usage: ts-node generate-map-data.ts <path-to-map.tmj>");
  process.exit(1);
}

const mapFile = path.join("../assets/levels", tmjFilePath);

console.log(`Processing file: ${mapFile}`);

// Read and parse the .tmj file
const tmjContent = fs.readFileSync(mapFile, "utf-8");
const tmjJson = JSON.parse(tmjContent);

if (!Array.isArray(tmjJson.layers)) {
  console.error("No layers array found in the .tmj file.");
  process.exit(1);
}

const tilesets = tmjJson.tilesets || [];
console.log(`Found ${tilesets.length} tilesets.`);

// Output directory: same as .tmj file
const outputDir = path.join("./code/levels/", path.dirname(tmjFilePath));

for (const layer of tmjJson.layers) {
  processLayer(layer, tilesets, outputDir);
}
