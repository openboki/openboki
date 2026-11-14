import { expect, test } from "@playwright/test";

// 単元が想定した誤答(切手代を消耗品費に入れる)に誤解IDが無く、「よくある思い込み」が出なかった
test("小口現金の報告で切手代を消耗品費にすると、よくある思い込みが出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("小口現金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("当座預金");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await work.getByLabel("借方の科目1").fill("消耗品費");
  await work.getByLabel("借方の金額1").fill("10500");
  await work.getByRole("button", { name: "行を追加" }).first().click();
  await work.getByLabel("借方の科目2").fill("旅費交通費");
  await work.getByLabel("借方の金額2").fill("2000");
  await work.getByLabel("貸方の科目1").fill("小口現金");
  await work.getByLabel("貸方の金額1").fill("12500");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText(/よくある思い込み/)).toBeVisible();
});
