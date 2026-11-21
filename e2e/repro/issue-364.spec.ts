import { expect, test } from "@playwright/test";

// ふりかえりが「結果と、その原因の2つの面を左と右に」とまとめると、語順どおりに「結果は左、原因は右」の規則に読める。
// 家賃の仕訳(支払家賃 / 現金)では結果の現金の減少が右に来るので、5つの取引すべてに当てはまる言い方にする
test("最初の単元のふりかえりが、結果と原因を左と右に書いたとまとめない", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  // ステップ10へは課題を解かないと進めないので、本文の文字列は単元のHTMLから確かめる
  const html = await page.content();
  expect(html).not.toContain("結果と、その原因の2つの面を左と右に");
  // ステップ2は2つの面を結果と原因で説明するが、左右の割り当てには結果・原因を使わない
  expect(html).toContain("「元手を入れた」という原因です");
  expect(html).not.toContain("結果の現金は左に、原因の資本金は右に");
});
