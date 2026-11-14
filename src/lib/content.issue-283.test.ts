import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Issue #283: #53で外した「右の表」の言い換えが、歴史の単元で「右側の元帳」「右側の試算」「右側に現れました」の形で戻っていた
// 帳簿の左右(「右の合計」「右側に載ります」、T勘定のalt)は別の意味なので対象にしない
const PANE_BY_POSITION = /右側の(元帳|試算|結果|仕訳帳|表)|右側に現れ/;

const files = [
  ...readdirSync("content", { recursive: true, encoding: "utf8" }).map((f) => join("content", f)).filter((f) => /\.(md|ya?ml)$/.test(f)),
  ...readdirSync("src/components/ide").map((f) => join("src/components/ide", f)),
  "src/lib/grading.ts",
];

describe("結果ペインを「右側の元帳」のような画面の位置で指さない", () => {
  it.each(files)("%s", (file) => {
    const hits = readFileSync(file, "utf8").split("\n").filter((line) => PANE_BY_POSITION.test(line));
    expect(hits).toEqual([]);
  });
});
