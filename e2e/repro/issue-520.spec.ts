import { expect, test } from "@playwright/test";

// Issue #520: 「預かったお金、仮のお金」で、給料の総額を現金で払う(ステップ2)と精算の貸借逆(ステップ6)に
// 誤解の説明が付かず、汎用文か誤解IDの無い説明だけが出ていた

const URL = "/units/receivables-and-payables/temporary-and-deposits";

test("給料を天引きせず現金で払うと天引きの誤解が付き、精算の貸借逆に向きの誤解が付く", async ({ page }) => {
  await page.goto(URL);
  await page.getByRole("button", { name: "今はしない" }).click();
  const w = page.getByRole("region", { name: "ワークスペース" });
  const status = page.getByRole("status");
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const fill = async (debit: [string, number][], credit: [string, number][]) => {
    const rm = w.locator("button[aria-label='行を削除']:not([disabled])");
    while ((await rm.count()) > 0) await rm.first().click();
    for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) await w.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
        await w.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
        await page.keyboard.press("Escape");
        await w.getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i][1]));
      }
    }
    await w.getByRole("button", { name: "記帳する", exact: true }).click();
  };

  await next();
  await fill([["給料", 100000]], [["現金", 100000]]);
  await expect(status.getByText("もう一歩")).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("普通預金");

  await fill([["給料", 100000]], [["普通預金", 97000], ["預り金", 3000]]);
  await expect(status.getByText("できました")).toBeVisible();
  await next();
  for (const [k, v] of [["資産", "減る"], ["負債", "減る"], ["純資産", "変わらない"], ["収益", "変わらない"], ["費用", "変わらない"]]) {
    await w.getByLabel(`${k}の予想`, { exact: true }).selectOption({ label: v });
  }
  await w.getByRole("button", { name: /予想して/ }).click();
  await next();
  await fill([["立替金", 2000]], [["現金", 2000]]);
  await next();
  await fill([["仮払金", 20000]], [["現金", 20000]]);
  await next();

  await fill([["仮払金", 20000]], [["旅費交通費", 18000], ["現金", 2000]]);
  await expect(status.getByText("もう一歩")).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
});
