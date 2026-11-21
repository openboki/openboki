import { expect, test } from "@playwright/test";

// Issue #517: 4年目・5年目の帳簿に入れるのは掛け売上・回収と貸倒引当金の取引だけで、仕入と支払家賃は
// 3年目の1年分のまま残る。「3年分が足された形」と言うだけでは、当期純利益を3年分のもうけと読んでしまうので、
// 省いている取引と、当期純利益がどの年のもうけでもないことを本文で断る
test("#517 貸倒れを見積もる: 4年目・5年目の断りが、仕入と家賃を省いていることと合っている", async ({ page }) => {
  await page.goto("/units/bad-debts/allowance-for-doubtful-accounts");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const result = page.getByRole("region", { name: "結果" });
  const ok = () => page.getByRole("status").getByText("できました").first().waitFor();
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const calc = async (value: string) => {
    await work.getByRole("textbox").or(work.getByRole("spinbutton")).first().fill(value);
    await work.getByRole("button", { name: "確認する" }).click();
    await ok();
  };

  await next();
  await calc("4000");
  await next();
  for (const [element, direction] of Object.entries({ 資産: "減る", 負債: "変わらない", 純資産: "減る", 収益: "変わらない", 費用: "増える" })) {
    await page.getByLabel(`${element}の予想`, { exact: true }).selectOption({ label: direction });
  }
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await ok();
  await next();
  await calc("196000");

  // ステップ5(4年目の観察): 仕入と家賃を省いていることと、当期純利益がどの年のもうけでもないことを断る
  await next();
  await expect(page.getByText("ステップ5 / 10")).toBeVisible();
  await expect(result).toContainText("2,500,000");
  await expect(result).toContainText("支払家賃");
  await expect(result).toContainText("600,000");
  await expect(guide.getByText(/仕入や家賃などほかの取引は省いています/)).toBeVisible();
  await expect(guide.getByText(/当期純利益はどの年のもうけも表していません/)).toBeVisible();

  await next();
  await calc("2000");
  await next();
  await work.getByLabel("借方の科目1").fill("貸倒引当金繰入");
  await work.getByLabel("借方の金額1").fill("2000");
  await work.getByLabel("貸方の科目1").fill("貸倒引当金");
  await work.getByLabel("貸方の金額1").fill("2000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await ok();

  // ステップ8(5年目の観察): 費用は3年目の1年分のままで、断りがそれと合っている
  await next();
  await expect(page.getByText("ステップ8 / 10")).toBeVisible();
  await expect(result).toContainText("支払家賃");
  await expect(result).toContainText("600,000");
  await expect(guide.getByText(/仕入や家賃は省いています/)).toBeVisible();
  await expect(guide.getByText(/当期純利益はどの年のもうけも表していません/)).toBeVisible();
  await expect(guide.getByText(/3年分が足された形/)).toHaveCount(0);
});
