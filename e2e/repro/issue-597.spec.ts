import { expect, test } from "@playwright/test";

// 「できました」は匿名サインインと保存より先に出る。保存の応答を待ってから移動すれば、
// 移動先はそのセッションで記録を読み込む(issue-327.spec.tsがこの順序を前提にする)
test("最初の回答の保存を待ってから別の単元へ移ると、移動先で記録を読み込む", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/attempts"));
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  expect((await saved).ok()).toBe(true);

  const attempts = page.waitForResponse((r) => r.url().includes("/rest/v1/attempts") && r.request().method() === "GET");
  await page.goto("/units/merchandise/three-account-method");
  const rows = (await (await attempts).json()) as { unit_id: string }[];
  expect(rows.map((r) => r.unit_id)).toContain("bookkeeping-basics/five-elements");
});
