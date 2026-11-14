import { expect, test } from "@playwright/test";

// Issue #292: 読みが他の科目の読みにも含まれる科目(現金 ⊂ 小口現金・現金過不足)を、読みを最後まで入れて抜けても確定しなかった
test("科目欄に「げんきん」と入れてTabで抜けると現金に確定し、記帳できる", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/checking-account");
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("当座預金");
  await work.getByLabel("借方の金額1").fill("200000");
  const credit = work.getByLabel("貸方の科目1");
  await credit.focus();
  await page.keyboard.type("げんきん", { delay: 30 });
  await page.keyboard.press("Tab");
  await expect(credit).toHaveValue("現金");
  await work.getByLabel("貸方の金額1").fill("200000");
  await expect(work.getByRole("button", { name: "記帳する" })).toBeEnabled();
});

test("科目欄に「びひん」と入れてTabで抜けると備品に確定する", async ({ page }) => {
  await page.goto("/units/cash-and-deposits/checking-account");
  await page.getByRole("button", { name: "次へ →" }).click();
  const debit = page.getByRole("region", { name: "ワークスペース" }).getByLabel("借方の科目1");
  await debit.focus();
  await page.keyboard.type("びひん", { delay: 30 });
  await page.keyboard.press("Tab");
  await expect(debit).toHaveValue("備品");
});
