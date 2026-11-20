import { expect, test } from "@playwright/test";

// 仕入の返品を「現金 / 仕入」、売上の返品を「雑損 / 売掛金」と記帳すると、誤解の説明が無く汎用文だけが出ていた
// (仕入の返品で左に現金を書く誤答は、#443で「掛けで買っても現金が減る」に付け替えた)
test("返品を現金や雑損で記帳すると、それぞれの誤解の説明が出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const post = async (debit: [string, number][], credit: [string, number][]) => {
    const removable = work.locator("button[aria-label='行を削除']:not([disabled])");
    while ((await removable.count()) > 0) await removable.first().click();
    for (const [side, lines] of [
      ["借方", debit],
      ["貸方", credit],
    ] as const) {
      await work.getByLabel(`${side}の科目1`).fill("");
      await work.getByLabel(`${side}の金額1`).fill("");
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

  await page.goto("/units/merchandise/returns-and-costs");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next();
  await post([["仕入", 52000]], [["買掛金", 50000], ["現金", 2000]]);
  await next();

  // ステップ3: 返品でお金が戻ると考えて左に現金を書く
  await post([["現金", 10000]], [["仕入", 10000]]);
  await expect(status).not.toContainText("結果の表で何が動くはずか");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("掛けで買っても現金が減る");
  await post([["買掛金", 10000]], [["仕入", 10000]]);
  await next();
  await post([["売掛金", 30000], ["発送費", 1500]], [["売上", 30000], ["現金", 1500]]);
  await next();

  // ステップ5: 返品を損と考えて左に雑損を書く
  await post([["雑損", 5000]], [["売掛金", 5000]]);
  await expect(status).not.toContainText("結果の表で何が動くはずか");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("返品を新しい取引として記録");
});
