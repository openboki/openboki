import { test, expect } from "@playwright/test";

// ブラウザを開き直した後(sessionStorageが無い)、トップの「続きから」を押すとステップ1が開いていた
test("トップの「続きから」で前回のステップが開く", async ({ browser }) => {
  const first = await browser.newContext({ locale: "ja-JP" });
  const page = await first.newPage();
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByText("今はしない", { exact: true }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  const state = await first.storageState();
  await first.close();

  // 開き直し(sessionStorageは引き継がれない)
  const second = await browser.newContext({ locale: "ja-JP", storageState: state });
  const top = await second.newPage();
  await top.goto("/");
  await top.getByRole("link", { name: "続きから: 5つの要素と仕訳" }).click();
  await expect(top).toHaveURL(/five-elements/);
  await expect(top.getByText("ステップ3 / 10")).toBeVisible();
  // 一度きりの指示なので、再読み込みで繰り返さないようURLから消す
  await expect(top).not.toHaveURL(/resume=/);
  await second.close();

  // 単元を直接開いたときは、これまでどおりステップ1で案内を出す
  const third = await browser.newContext({ locale: "ja-JP", storageState: state });
  const direct = await third.newPage();
  await direct.goto("/units/bookkeeping-basics/five-elements");
  await expect(direct.getByText("前回はステップ3まで進みました。")).toBeVisible();
  await expect(direct.getByText("ステップ1 / 10")).toBeVisible();
  await third.close();
});
