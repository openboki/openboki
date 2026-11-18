import { expect, test } from "@playwright/test";

// 5つの要素と仕訳 ステップ8で、収益と費用を足した130000を答えると、汎用文ではなく費用を引くことを説明する(Issue #433)
test("当期純利益に収益+費用の130000を答えると、費用は引くと説明する", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const ok = page.getByRole("status").filter({ hasText: "できました" });
  const post = async (d: string, c: string, amount: number) => {
    await work.getByLabel("借方の科目1").fill(d);
    await page.keyboard.press("Escape");
    await work.getByLabel("借方の金額1").fill(String(amount));
    await work.getByLabel("貸方の科目1").fill(c);
    await page.keyboard.press("Escape");
    await work.getByLabel("貸方の金額1").fill(String(amount));
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(ok).toBeVisible();
    await next();
  };
  await next();
  await post("現金", "資本金", 1000000);
  await work.getByLabel("資産の予想").selectOption({ label: "変わらない" });
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await post("現金", "借入金", 300000);
  await post("現金", "売上", 80000);
  await post("支払家賃", "現金", 50000);
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [a, b] of Object.entries({ 現金: "資産", 備品: "資産", 借入金: "負債", 資本金: "純資産", 売上: "収益", 支払家賃: "費用" })) {
    await board.getByRole("button", { name: new RegExp(`^${a}`) }).first().click();
    await board.getByRole("button", { name: new RegExp(b) }).first().click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(ok).toBeVisible();
  await next();
  await work.getByPlaceholder("金額(円)").fill("130000");
  await work.getByRole("button", { name: "確認する" }).click();
  const wrong = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(wrong).toBeVisible();
  await expect(wrong).not.toContainText("まだ合っていません");
  await expect(wrong).toContainText("引");
});
