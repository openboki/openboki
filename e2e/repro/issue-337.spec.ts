import { test, expect } from "@playwright/test";

test("debugで行を選び直すと、前の行への「もう一歩」が消える", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  await next();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("textbox").first().press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  await next();
  await expect(page.getByText("ステップ4 /")).toBeVisible();
  await work.getByLabel("借方の科目1").fill("ジョヴァンニ");
  await work.getByLabel("借方の金額1").fill("60");
  await work.getByLabel("貸方の科目1").fill("胡椒(アレクサンドリア航海)");
  await work.getByLabel("貸方の金額1").fill("60");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  await next();
  await expect(page.getByText("ステップ6 /")).toBeVisible();

  await work.getByRole("radio").nth(1).check();
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "両側がそろっています" })).toBeVisible();

  await work.getByRole("radio").nth(2).check();
  await expect(page.getByText("両側がそろっています")).toHaveCount(0);

  // 前の行に戻して同じ答えで押しても、採点し直して案内を出す
  await work.getByRole("radio").nth(1).check();
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "両側がそろっています" })).toBeVisible();
});
