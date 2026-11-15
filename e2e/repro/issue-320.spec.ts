import { expect, test } from "@playwright/test";

// Issue #320: tweakで目標を達成した瞬間にフォーカスが状態欄へ移り、→キーでスライダーを動かし続けられなかった
test("条件を変えるの達成後も、→キーでスライダーの値が変わる", async ({ page }) => {
  await page.goto("/units/depreciation/straight-line");
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.isVisible()) await later.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("車両運搬具");
  await work.getByLabel("借方の金額1").fill("1200000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("1200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();

  const life = page.getByRole("slider", { name: /耐用年数/ });
  await life.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await expect(life).toHaveValue("6");
  await page.keyboard.press("ArrowRight");
  await expect(life).toHaveValue("7");
  await expect(life).toBeFocused();
});
