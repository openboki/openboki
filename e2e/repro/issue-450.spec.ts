import { expect, test } from "@playwright/test";

// 「貸したお金、借りたお金」で、単元が想定した誤答(貸付金の左を支払利息にする、利息を1年分で計算する)に
// 誤解IDが無く、「もう一歩」のfeedbackだけが出て「よくある思い込み」が出なかった
test("貸付金の左を支払利息にしたときと、利息を1年分の6,000円で答えたときに、よくある思い込みが出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const post = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await page.goto("/units/receivables-and-payables/loans");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await post("支払利息", "普通預金", "100000");
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText(/よくある思い込み/)).toBeVisible();
  await post("貸付金", "普通預金", "100000");
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  for (const [k, v] of [["資産", "増える"], ["負債", "変わらない"], ["純資産", "増える"], ["収益", "増える"], ["費用", "変わらない"]])
    await page.getByLabel(`${k}の予想`, { exact: true }).selectOption({ label: v });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await post("支払利息", "普通預金", "3000");
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await page.getByPlaceholder(/金額/).fill("6000");
  await page.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText(/よくある思い込み/)).toBeVisible();
});
