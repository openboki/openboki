import { expect, test } from "@playwright/test";

// Issue #415: 絹を買った相手ニッコロの代わりにジョヴァンニを書くと、相手違いの説明が無く汎用文だけが出ていた
test("人名勘定の相手を取り違えると、誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const entry = async (d: string, c: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill("100");
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill("100");
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });

  await entry("絹(フランドル航海)", "ジョヴァンニ");
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("まだ合っていません");
  await expect(status).toContainText("ニッコロ");
  await expect(status).toContainText("よくある思い込み");

  // 汎用文を読んで左右を入れ替えても、相手違いの説明が出る
  await entry("ジョヴァンニ", "絹(フランドル航海)");
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("まだ合っていません");
  await expect(status).toContainText("ニッコロ");
  await expect(status).toContainText("よくある思い込み");
});
