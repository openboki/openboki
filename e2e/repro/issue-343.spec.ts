import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Issue #343: ふりかえりが買掛金の支払いを「義務がお金に変わる」とまとめ、ステップ6の「義務をお金で消す」(負債と現金がともに減る)と食い違っていた。
// あわせて、predictのステップ3で学習者は仕訳を書いていないのに「納品の日に左に書いた」と書いていた
const body = readFileSync("content/topics/merchandise/credit-transactions.md", "utf8");

test("掛けで売る、掛けで買うのふりかえりが支払いを「義務がお金に変わる」と書かない", () => {
  const recap = body.split("## ふりかえり")[1];
  expect(recap).not.toMatch(/権利や義務がお金に変わる/);
  expect(recap).toMatch(/義務をお金で消す/);
});

test("掛けで売る、掛けで買うが予想だけのステップを「左に書いた」と言わない", () => {
  expect(body).not.toMatch(/納品の日に左に書いた/);
});
