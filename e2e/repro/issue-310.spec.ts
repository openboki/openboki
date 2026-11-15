import { expect, test } from "@playwright/test";

// Issue #310: ツアー12/12の「3級パスの最初の単元へ」で抜けると、チュートリアル単元がstartedのまま残り、トップが「続きから: はじめての記帳」を出し続けた
test("ツアーの最終カードから最初の単元へ進むと、トップがチュートリアルの続きを出さない", async ({ page }) => {
  const dlg = page.getByRole("dialog", { name: "チュートリアル" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto("/units/tutorial/first-entry");
  await dlg.getByRole("button", { name: "はじめる" }).click();
  await dlg.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("100000");
  for (let i = 0; i < 3; i++) await dlg.getByRole("button", { name: "次へ" }).click();
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  for (let i = 0; i < 4; i++) await dlg.getByRole("button", { name: "次へ" }).click();
  await dlg.getByRole("link", { name: "3級パスの最初の単元へ" }).click();
  await expect(page).toHaveURL(/five-elements/);
  // 完了の保存は遷移と並行して送られるので、終わるのを待ってからトップを開く
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  // 進捗の読み込み後にボタンが差し替わるので、チュートリアル以外の行き先になるまで待つ
  const first = page.locator("main").getByRole("link").first();
  await expect(first).toHaveText(/5つの要素と仕訳/, { timeout: 10_000 });
  await page.waitForTimeout(1500);
  await expect(first).not.toHaveText("続きから: はじめての記帳");
});
