import { test, expect } from "@playwright/test";

// 残高が0になった科目が、このステップの差分ごと貸借対照表から消える
test("売掛金を全部消す記帳の後も、貸借対照表で売掛金の減少が見える", async ({ page }) => {
  await page.goto("/units/bad-debts/bad-debt-loss");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  await next();
  await work.getByLabel("借方の科目1").fill("売掛金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("売上");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  for (const [k, v] of [["資産", "減る"], ["負債", "変わらない"], ["純資産", "減る"], ["収益", "変わらない"], ["費用", "増える"]])
    await page.getByLabel(`${k}の予想`, { exact: true }).selectOption({ label: v });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await work.getByRole("textbox").first().fill("-18000");
  await page.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("20000");
  await work.getByRole("button", { name: "行を追加" }).first().click();
  await work.getByLabel("借方の科目2").fill("貸倒損失");
  await work.getByLabel("借方の金額2").fill("30000");
  await work.getByLabel("貸方の科目1").fill("売掛金");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  const bs = page.locator("section[aria-label='貸借対照表']");
  const row = bs.locator("[data-account='accounts_receivable']");
  await expect(row).toHaveText(/^売掛金\s*0\s*[−-]\s*減少\s*50,000$/);
});

// 評価勘定を消して0になった行は、控除額の大きさが減ったので「− 減少」と出る
test("車両運搬具減価償却累計額を消す記帳の後、累計額の行が0と減少300,000で残る", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByPlaceholder(/金額/).first().fill("900000");
  await work.getByRole("button", { name: "確認する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const lines: [string, string, number][] = [["借方", "現金", 850000], ["借方", "車両運搬具減価償却累計額", 300000], ["借方", "固定資産売却損", 50000], ["貸方", "車両運搬具", 1200000]];
  const count = { 借方: 0, 貸方: 0 };
  for (const [side, account, amount] of lines) {
    const n = ++count[side as "借方" | "貸方"];
    if (n > 1) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
    await work.getByLabel(`${side}の科目${n}`).fill(account);
    await work.getByLabel(`${side}の金額${n}`).fill(String(amount));
  }
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  const row = page.locator("section[aria-label='貸借対照表'] [data-account='accumulated_depreciation_vehicle']");
  await expect(row).toHaveText(/^車両運搬具減価償却累計額\s*0\s*[−-]\s*減少\s*300,000$/);
});
