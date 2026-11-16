import { expect, test } from "@playwright/test";

// 立替金を通信費にする・未収入金の回収を受取利息にすると、誤解の説明が無く汎用文だけが出ていた
test("立替金の代わりに通信費、未収入金の回収を受取利息にすると誤解の説明が付く", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const post = async (debit: [string, number][], credit: [string, number][]) => {
    const removable = work.locator("button[aria-label='行を削除']:not([disabled])");
    while ((await removable.count()) > 0) await removable.first().click();
    for (const [side, lines] of [
      ["借方", debit],
      ["貸方", credit],
    ] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0)
          await work
            .getByRole("button", { name: "行を追加" })
            .nth(side === "借方" ? 0 : 1)
            .click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
        await work.getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i][1]));
      }
    }
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  const predict = async (v: string[]) => {
    const keys = ["資産", "負債", "純資産", "収益", "費用"];
    for (let i = 0; i < 5; i++) await work.getByLabel(`${keys[i]}の予想`, { exact: true }).selectOption({ label: v[i] });
    await work.getByRole("button", { name: "予想して記帳する" }).click();
  };
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });

  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next();
  await post([["給料", 100000]], [["普通預金", 97000], ["預り金", 3000]]);
  await next();
  await predict(["減る", "減る", "変わらない", "変わらない", "変わらない"]);
  await next();
  await post([["通信費", 2000]], [["現金", 2000]]);
  await expect(status).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("立替金");

  await post([["立替金", 2000]], [["現金", 2000]]);
  await next();
  await post([["仮払金", 20000]], [["現金", 20000]]);
  await next();
  await post([["旅費交通費", 18000], ["現金", 2000]], [["仮払金", 20000]]);
  await next();
  await predict(["増える", "増える", "変わらない", "変わらない", "変わらない"]);
  await next();
  await post([["仮受金", 50000]], [["受取利息", 50000]]);
  await expect(status).toBeVisible();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("未収入金");
});
