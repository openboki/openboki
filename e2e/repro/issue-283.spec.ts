import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

// Issue #283: タブ表示の画面幅では右に何も無いのに、歴史の単元の成功文が「右側の元帳で」と結果ペインを位置で指していた
test("390pxで航海の儲けの単元を記帳すると、成功文が「右側」を指さない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("tab", { name: /ワークスペース/ }).click();
  await page.getByPlaceholder(/金額/).first().fill("30");
  await page.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  // ステップ2で回答すると表示がワークスペースから外れるので、もう一度タブを押す
  await page.getByRole("tab", { name: /ワークスペース/ }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("ジョヴァンニ");
  await work.getByLabel("借方の金額1").fill("60");
  await work.getByLabel("貸方の科目1").fill("胡椒(アレクサンドリア航海)");
  await work.getByLabel("貸方の金額1").fill("60");
  await work.getByRole("button", { name: /記帳する/ }).click();
  const status = page.getByRole("status").filter({ hasText: "できました" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("右側");
});
