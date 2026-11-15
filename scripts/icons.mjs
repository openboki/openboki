// src/app/icon.svgからfavicon.icoとapple-icon.pngを書き出す。icon.svgを変えたら`make icons`で回す。
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = await readFile("src/app/icon.svg");
const png = (size) => sharp(svg, { density: 72 * (size / 32) * 4 }).resize(size, size);

// iOSは透過を黒で埋めるので、角丸の外側をタイルと同じ色で塗る
await png(180).flatten({ background: "#1e6b62" }).toFile("src/app/apple-icon.png");

// ICOはPNGをそのまま格納できる。ヘッダー6バイト + 1枚あたり16バイトの目録 + PNG本体
const images = await Promise.all([16, 32].map(async (size) => ({ size, data: await png(size).png().toBuffer() })));
const header = Buffer.alloc(6 + 16 * images.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach(({ size, data }, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(data.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...images.map((image) => image.data)]));
