import { expect, test } from "@playwright/test";

// Issue #436: 貸倒れを見積もるは3年目から5年目を1冊の帳簿で続けるので、5年目の損益計算書に
// 3年目・4年目の繰入6,000と5年目の戻入3,000が並ぶ。4年目にしか無かった「合計の表」の断りを5年目にも書く
test("#436 貸倒れを見積もる: 5年目のステップにも損益計算書が3年分の合計だという断りがある", async ({ page }) => {
  await page.goto("/units/bad-debts/allowance-for-doubtful-accounts");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const ok = () => page.getByRole("status").getByText("できました").first().waitFor();
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const calc = async (value: string) => {
    await work.getByRole("textbox").or(work.getByRole("spinbutton")).first().fill(value);
    await work.getByRole("button", { name: "確認する" }).click();
    await ok();
  };
  const predict = async (answer: Record<string, string>) => {
    for (const [element, direction] of Object.entries(answer)) {
      await page.getByLabel(`${element}の予想`, { exact: true }).selectOption({ label: direction });
    }
    await page.getByRole("button", { name: "予想して記帳する" }).click();
    await ok();
  };

  await next();
  await calc("4000");
  await next();
  await predict({ 資産: "減る", 負債: "変わらない", 純資産: "減る", 収益: "変わらない", 費用: "増える" });
  await next();
  await calc("196000");
  await next();
  await next();
  await calc("2000");
  await next();
  await work.getByLabel("借方の科目1").fill("貸倒引当金繰入");
  await work.getByLabel("借方の金額1").fill("2000");
  await work.getByLabel("貸方の科目1").fill("貸倒引当金");
  await work.getByLabel("貸方の金額1").fill("2000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await ok();
  // 成功文が、表の繰入6,000は2年分の合計だと示す
  await expect(page.getByText("3年目の4,000に今年の2,000が足された金額です")).toBeVisible();

  // 5年目の観察のステップに、4年目と同じ合計の断りがある
  await next();
  await expect(guide.getByText(/売上3,200,000は3年分の合計、貸倒引当金繰入6,000は3年目の4,000と4年目の2,000の合計/)).toBeVisible();

  // 5年目の決算のステップに、繰入と戻入が並ぶ理由と、1つの年には片方しか出ないことが書いてある
  await next();
  await expect(guide.getByText(/5年目だけの損益計算書なら出るのは戻入3,000だけです/)).toBeVisible();
  await predict({ 資産: "増える", 負債: "変わらない", 純資産: "増える", 収益: "増える", 費用: "変わらない" });
  await expect(page.getByText("繰入6,000は3年目と4年目の分、戻入3,000は今年の分です")).toBeVisible();
});
