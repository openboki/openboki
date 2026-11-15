import { expect, test } from "@playwright/test";

// 掛け仕入の右を現金・未払金にする、納品の予想で負債を増やすと、該当する誤解があるのに「よくある思い込み」が出なかった
test("掛けで売る、掛けで買うの誤答で、よくある思い込みが出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const misconception = page.getByText(/よくある思い込み/);
  await page.goto("/units/merchandise/credit-transactions");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("40000");
  for (const [account, name] of [
    ["現金", "掛けで買っても現金が減る"],
    ["未払金", "商品の後払いも未収入金・未払金"],
  ]) {
    await work.getByLabel("貸方の科目1").fill(account);
    await work.getByLabel("貸方の金額1").fill("40000");
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
    await expect(misconception).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  }
  await work.getByLabel("貸方の科目1").fill("買掛金");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  const picks: [string, string][] = [
    ["資産", "増える"],
    ["負債", "増える"],
    ["純資産", "増える"],
    ["収益", "増える"],
    ["費用", "変わらない"],
  ];
  for (const [element, label] of picks) {
    await work.getByRole("combobox", { name: `${element}の予想`, exact: true }).selectOption({ label });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(misconception).toBeVisible();
  await expect(page.getByText("売掛金と買掛金の取り違え")).toBeVisible();
});
