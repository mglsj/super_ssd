// Renders public/favicon.svg into the raster icons browsers and phones ask for:
//   public/favicon.ico (16, 32, 48 px, PNG-in-ICO) and public/apple-touch-icon.png (180 px).
// Run after editing favicon.svg:  node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const png = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

writeFileSync(new URL('../public/apple-touch-icon.png', import.meta.url), png(180));

// ICO container holding PNG images (supported by every current browser)
const sizes = [16, 32, 48];
const images = sizes.map(png);
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e); // width
  header.writeUInt8(s, e + 1); // height
  header.writeUInt8(0, e + 2); // palette
  header.writeUInt8(0, e + 3); // reserved
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, ...images]));
console.log('wrote public/favicon.ico and public/apple-touch-icon.png');
