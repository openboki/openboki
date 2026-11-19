import { expect, test } from "@playwright/test";

// 給料から預かった3,000円を雑益(収益)にすると、誤解の説明が無く汎用文だけが出ていた
test("預り金を雑益にすると預り金・負債の説明が付く", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const set = async (label: string, value: string) => {
    await work.getByLabel(label).fill(value);
    await page.keyboard.press("Escape");
  };
  await set("借方の科目1", "給料");
  await set("借方の金額1", "100000");
  await set("貸方の科目1", "普通預金");
  await set("貸方の金額1", "97000");
  await work.getByRole("button", { name: "行を追加" }).nth(1).click();
  await set("貸方の科目2", "雑益");
  await set("貸方の金額2", "3000");
  await work.getByRole("button", { name: "記帳する" }).click();

  const status = page.getByRole("status");
  await expect(status.getByText("もう一歩")).toBeVisible();
  await expect(status).not.toContainText("結果の表で何が動くはずかを考えて");
  await expect(status).toContainText("預り金");
  await expect(status).toContainText("負債");
});
