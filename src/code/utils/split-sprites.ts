import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

if (process.argv.length < 3) {
  console.error('Usage: ts-node split-sprites.ts <input.png>');
  process.exit(1);
}

const inputPath = process.argv[2];
if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const baseName = path.basename(inputPath, path.extname(inputPath));
const dirName = path.dirname(inputPath);

// Each sprite is 64x64, with 16px border and 16px between each sprite
const SPRITE_SIZE = 64;
const BORDER = 16;
const GAP = 16;
const ROWS = 2;
const COLS = 4;

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const x = BORDER + col * (SPRITE_SIZE + GAP);
    const y = BORDER + row * (SPRITE_SIZE + GAP);
    const outNum = row * COLS + col + 1;
    const outPath = path.join(dirName, `${baseName}_${outNum}.png`);
    const cmd = `magick convert "${inputPath}" -crop ${SPRITE_SIZE}x${SPRITE_SIZE}+${x}+${y} +repage "${outPath}"`;
    try {
      execSync(cmd);
      console.log(`Saved: ${outPath}`);
    } catch (e) {
      console.error(`Failed to extract image ${outNum}:`, e);
    }
  }
}
