import { expect, test } from "@playwright/test";

// Issue #454: 残存価額を動かすステップで、耐用年数を8年にするだけで達成になり、成功文が残存価額の話をしていた。
// 動かす条件だけをスライダーにし、ほかの条件は固定して値だけ見せる
test("定額法のtweakは、そのステップで動かす条件だけをスライダーにする", async ({ page }) => {
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
  await expect(work.getByRole("slider")).toHaveCount(1);
  await expect(work.getByText("取得原価(このステップでは固定)")).toBeVisible();
  await expect(work.getByText("残存価額(このステップでは固定)")).toBeVisible();
  await work.getByRole("slider", { name: /耐用年数/ }).fill("6");
  await expect(done).toBeVisible();
  await next.click();

  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await expect(work.getByRole("slider")).toHaveCount(1);
  await expect(work.getByText("耐用年数(このステップでは固定)")).toBeVisible();
  await expect(work.getByText("6 年", { exact: true })).toBeVisible();
  const residual = work.getByRole("slider", { name: /残存価額/ });
  await residual.fill("250000");
  await expect(done).toHaveCount(0);
  await residual.fill("300000");
  await expect(done).toBeVisible();
  await expect(done).toContainText("残存価額");
});
