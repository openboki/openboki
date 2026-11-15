// src/app/icon.svgからfavicon.ico、apple-icon.png、opengraph-image.pngを書き出す。icon.svgを変えたら`make icons`で回す。
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

// OG画像。next/ogで描くと日本語フォントのファイルをリポジトリに置く必要があるので、静的なPNGを書き出す。
// 文字は実行した環境のNoto Sans CJK JPで描く(無い環境で回すと書体が変わる)。色は既定テーマ「街の小さな会社」
const mark = svg.toString().replace(/^<svg[^>]*>|<\/svg>\s*$/g, "");
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="Noto Sans CJK JP">
  <rect width="1200" height="630" fill="#fbf7f1"/>
  <rect y="606" width="1200" height="24" fill="#1e6b62"/>
  <g transform="translate(96 156) scale(4.5)">${mark}</g>
  <text x="96" y="430" font-size="112" font-weight="700" fill="#2b251f">Open簿記</text>
  <text x="96" y="520" font-size="48" fill="#6b6158">会計を原理から、手を動かして学ぶ</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile("src/app/opengraph-image.png");
