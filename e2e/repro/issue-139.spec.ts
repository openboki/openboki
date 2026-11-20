import { expect, test } from "@playwright/test";

// Issue #139: tweakは出力の値だけで達成になるのに、成功文が特定の条件(6年 / 残存価額300,000)を前提に書かれていた。
// 動かせる条件はIssue #454で1つに絞ったので、別の条件で達成する経路は無くなった
test("定額法のtweakを達成すると、成功文が1年分の金額を言う", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const done = page.getByRole("status").filter({ hasText: "できました" });

  await page.goto("/units/depreciation/straight-line");
  await next.click();
  await work.getByLabel("借方の科目1").fill("車両運搬具");
  await work.getByLabel("借方の金額1").fill("1200000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("1200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(done).toBeVisible();
  await next.click();

  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await work.getByRole("slider", { name: /耐用年数/ }).fill("6");
  await expect(done).toBeVisible();
  await expect(done).toContainText("1年分が200,000円");
  await next.click();

  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await work.getByRole("slider", { name: /残存価額/ }).fill("300000");
  await expect(done).toBeVisible();
  await expect(done).toContainText("1年分が150,000円");
});
