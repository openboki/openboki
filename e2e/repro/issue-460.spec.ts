import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["iPhone 13"] });

// 誤答のあと開き直して「続きから」で再開すると、前回の誤答の仕訳がエディタに戻り、説明と比較表がその仕訳を指す
test("続きからで再開したとき、誤答の説明とエディタの中身が食い違わない(post)", async ({ browser }) => {
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  let page = await context.newPage();
  await page.goto("/units/bad-debts/bad-debt-loss");
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
  let work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("売上");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("売掛金");
  await work.getByLabel("貸方の金額1").fill("30000");
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/attempts") && r.request().method() === "POST" && r.ok());
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();
  await saved;
  await page.waitForLoadState("networkidle");
  await page.close();

  // タブを開き直す(sessionStorageは引き継がれない)
  page = await context.newPage();
  await page.goto("/units/bad-debts/bad-debt-loss");
  await page.getByRole("button", { name: "続きから" }).click();
  await page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name: "ワークスペース" }).click();
  work = page.getByRole("region", { name: "ワークスペース" });
  await expect(page.getByRole("status").filter({ hasText: "もう一歩" })).toBeVisible();
  await expect(work.getByLabel("借方の科目1")).toHaveValue("売上");
  await expect(work.getByLabel("借方の金額1")).toHaveValue(/30,?000/);
  await expect(work.getByLabel("貸方の科目1")).toHaveValue("売掛金");
  await expect(work.getByLabel("貸方の金額1")).toHaveValue(/30,?000/);
  await context.close();
});
