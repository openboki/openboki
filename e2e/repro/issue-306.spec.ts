import { expect, test } from "@playwright/test";

// Issue #306: 小切手で払う ステップ3で資産を「変わらない」と予想すると、誤答と合わない「小切手を渡したら現金が減る」が付いていた
test("小切手で払う ステップ3で資産を変わらないと予想すると、引き落としまで減らないという思い込みが出る", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/checking-account");
  const skip = page.getByRole("button", { name: "今はしない" });
  if (await skip.isVisible()) await skip.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("当座預金");
  await work.getByLabel("借方の金額1").fill("200000");
  await work.getByLabel("貸方の科目1").fill("普通預金");
  await work.getByLabel("貸方の金額1").fill("200000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  const picks: Record<string, string> = { 資産: "none", 負債: "decrease", 純資産: "none", 収益: "none", 費用: "none" };
  for (const [el, v] of Object.entries(picks)) await work.getByLabel(`${el}の予想`, { exact: true }).selectOption(v);
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(page.getByText("よくある思い込み: 小切手を渡したら現金が減る")).toHaveCount(0);
  await expect(page.getByText("よくある思い込み: 引き落とされるまで当座預金は減らない")).toBeVisible();
});
