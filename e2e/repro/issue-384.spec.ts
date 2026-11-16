import { expect, test } from "@playwright/test";

// Issue #384: 損失が出たときに結果ペインの「当期純損失」を押すと、押した語の見出しと損失の説明が展開前に出る
test("当期純損失を押すと、損失の語として説明が出る", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByPlaceholder(/金額/).fill("900000");
  await work.getByPlaceholder(/金額/).press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
  const rows: [string, string, number][] = [
    ["借方", "現金", 850000],
    ["借方", "車両運搬具減価償却累計額", 300000],
    ["借方", "固定資産売却損", 50000],
    ["貸方", "車両運搬具", 1200000],
  ];
  let debit = 0;
  for (const [side, account, amount] of rows) {
    const i = side === "借方" ? ++debit : 1;
    if (side === "借方" && i > 1) await work.getByRole("button", { name: "行を追加" }).nth(0).click();
    await work.getByLabel(`${side}の科目${i}`).fill(account);
    await work.getByLabel(`${side}の金額${i}`).fill(String(amount));
  }
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();

  const result = page.getByRole("region", { name: "結果" });
  const buttons = result.getByRole("button", { name: "当期純損失" });
  for (let i = 0; i < (await buttons.count()); i++) {
    await buttons.nth(i).click();
    const dialog = page.getByRole("dialog", { name: "当期純損失" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("用語集では「当期純利益」");
    await expect(dialog).toContainText("マイナスになったときは当期純損失と呼ぶ");
    await expect(dialog.getByRole("button", { name: "もっと見る" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("利益のときの「当期純利益」は見出しがそのまま", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("region", { name: "結果" }).getByRole("button", { name: "当期純利益" }).first().click();
  const dialog = page.getByRole("dialog", { name: "当期純利益" });
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toContainText("用語集では");
});
