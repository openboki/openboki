import { expect, test } from "@playwright/test";

// Issue #623: 歴史パスから「5つの要素と仕訳」を最後まで進めると、ふりかえりの本文が3級パスの「仕入と売上」を
// 次の単元と名指しし、歴史パスの続きへ戻る道が無かった。本文の名指しを外し、単元を含む学習パスへのリンクを出す。
// 「次の単元」ボタンはテーマ順のまま(URLでパスの文脈は渡さない)
test("歴史パスから来た5つの要素と仕訳の最後に、歴史パスへ戻るリンクがあり、本文が仕入と売上を名指ししない", async ({ page }) => {
  await page.goto("/paths/accounting-history");
  await page.getByRole("link", { name: /5つの要素と仕訳/ }).first().click();
  await page.waitForURL(/five-elements/);
  const work = page.getByRole("region", { name: "ワークスペース" });
  const guide = page.getByRole("region", { name: "ガイド" });
  const next = () => page.getByRole("button", { name: "次へ →" }).first().click();
  const solved = () => expect(page.getByRole("status").filter({ hasText: "できました" }).first()).toBeVisible();
  const post = async (debit: string, credit: string, amount: number) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill(String(amount));
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill(String(amount));
    await page.getByRole("button", { name: "記帳する" }).click();
    await solved();
  };
  await next();
  await post("現金", "資本金", 1000000);
  await next();
  await page.getByLabel("資産の予想").selectOption({ label: "変わらない" });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await solved();
  await next();
  await post("現金", "借入金", 300000);
  await next();
  await post("現金", "売上", 80000);
  await next();
  await post("支払家賃", "現金", 50000);
  await next();
  const board = page.getByRole("group", { name: "仕分けボード" });
  for (const [item, box] of [
    ["現金", "資産"],
    ["備品", "資産"],
    ["借入金", "負債"],
    ["資本金", "純資産"],
    ["売上", "収益"],
    ["支払家賃", "費用"],
  ]) {
    await board.getByRole("button", { name: item, exact: true }).first().click();
    await board.getByRole("button", { name: new RegExp(box) }).first().click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await next();
  const amount = work.getByRole("textbox").or(work.getByRole("spinbutton")).first();
  await amount.fill("30000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next();
  await amount.fill("1330000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next();
  await expect(page.getByText("ステップ10 / 10")).toBeVisible();

  // 本文は3級パスの次の単元を名指ししない
  await expect(guide).not.toContainText("次の単元「仕入と売上」");
  await expect(guide).not.toContainText("仕入と売上");
  // 単元を含む学習パスが両方並び、歴史パスへ戻れる
  const historyLink = guide.getByRole("link", { name: "会計の歴史パス" });
  await expect(historyLink).toHaveAttribute("href", "/paths/accounting-history");
  await expect(guide.getByRole("link", { name: "簿記3級合格パス" })).toHaveAttribute("href", "/paths/boki-3");
  // 「次の単元」ボタンはテーマ順のまま
  await expect(page.getByRole("link", { name: /^次の単元: 仕入と売上/ })).toBeVisible();

  await historyLink.click();
  await page.waitForURL(/\/paths\/accounting-history$/);
  await expect(page.getByRole("link", { name: /覚え書きと人名勘定/ })).toBeVisible();
});
