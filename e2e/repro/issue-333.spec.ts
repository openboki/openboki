import { expect, test } from "@playwright/test";

// Issue #333: コーヒーマシンを現金で買う予想で資産「増える」を選ぶと、誤解の説明が無く汎用文だけが出ていた

test("備品を現金で買う予想で資産「増える」に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("資産の予想").selectOption({ label: "増える" });
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).toContainText("入れ替わ");
  await expect(status).toContainText("よくある思い込み: 資産の中の移動で合計が動く");
  await expect(page.getByRole("status").filter({ hasText: "予想と実際の動きが違いました" })).toHaveCount(0);
});
