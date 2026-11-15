import { expect, test } from "@playwright/test";

// 390pxで「答えを見る」が出ると下部バーが折り返し、「次へ →」が右下から左下の2段目へ移る
test.use({ viewport: { width: 390, height: 664 } });

test("答えを見るが出ても「次へ →」は右下に留まる", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const prev = page.getByRole("button", { name: "← 前へ" });
  const fill = async (debit: string, credit: string) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill("1000000");
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill("1000000");
    await work.getByRole("button", { name: "記帳する", exact: true }).click();
  };
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click();
  await next.click();
  await page.getByRole("tab", { name: /ワークスペース/ }).click();
  const before = await next.boundingBox();
  await fill("資本金", "現金");
  await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();
  await fill("現金", "借入金");
  await expect(page.getByRole("button", { name: "答えを見る" })).toBeVisible();
  const after = await next.boundingBox();
  expect(Math.round(after!.x)).toBe(Math.round(before!.x));
  expect(Math.round(after!.y)).toBe(Math.round(before!.y));
  // 「← 前へ」も「次へ →」と同じ段の左隣に留まる
  const prevBox = await prev.boundingBox();
  expect(prevBox!.x + prevBox!.width).toBeLessThanOrEqual(after!.x);
  expect(Math.abs(prevBox!.y + prevBox!.height / 2 - (after!.y + after!.height / 2))).toBeLessThan(2);
});
