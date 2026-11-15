import { expect, test } from "@playwright/test";

// ふりかえりが「相手ごとのページの代わりに勘定科目を使う」と書き、得意先元帳・仕入先元帳に人名勘定が残る現代の実務と食い違っていた。
// 参照先の単元も文字列だけでリンクになっていなかった
test("覚え書きと人名勘定のふりかえりが人名勘定を過去のものとせず、参照先の単元がリンクになる", async ({ page }) => {
  const guide = page.getByRole("region", { name: "ガイド" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await next.click();
  await work.getByPlaceholder(/金額/).fill("70");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await work.getByRole("button", { name: "わかった" }).click().catch(() => {});
  for (const [item, side] of [
    ["3月9日", "左"],
    ["3月14日", "右"],
    ["3月18日", "右"],
    ["3月20日", "左"],
    ["3月22日", "左"],
  ]) {
    await work.getByRole("button", { name: new RegExp("^" + item) }).click();
    await work.getByRole("button", { name: new RegExp("^" + side) }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await work.getByPlaceholder(/金額/).fill("70");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ7 / 7")).toBeVisible();
  await expect(guide.getByText("相手ごとのページの代わりに")).toHaveCount(0);
  await expect(guide.getByRole("link", { name: /掛けで売る、掛けで買う/ })).toHaveAttribute(
    "href",
    "/units/merchandise/credit-transactions",
  );
});
