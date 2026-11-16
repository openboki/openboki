import { expect, test } from "@playwright/test";

// 前払金・前受金、未収入金・未払金を取り違えると、誤解の説明が無く汎用文だけが出ていた
test("商品以外の後払いと手付金で、似た4科目の取り違えに誤解の説明が付く", async ({ page }) => {
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
  const predict = async () => {
    const v = { 資産: "増える", 負債: "増える", 純資産: "変わらない", 収益: "変わらない", 費用: "変わらない" };
    for (const [k, label] of Object.entries(v)) await work.getByLabel(`${k}の予想`, { exact: true }).selectOption({ label });
    await page.getByRole("button", { name: "予想して記帳する" }).click();
  };

  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next();
  await post([["未収入金", 50000]], [["備品", 50000]]);
  await next();
  await predict();
  await next();

  // ステップ4: 払った手付金を前受金にする
  await post([["前受金", 10000]], [["現金", 10000]]);
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("前払金と前受金の取り違え");
  await post([["前払金", 10000]], [["現金", 10000]]);
  await next();

  // ステップ5: 前払金の代わりに前受金を消す
  await post([["仕入", 40000]], [["前受金", 10000], ["買掛金", 30000]]);
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("前払金と前受金の取り違え");
  await post([["仕入", 40000]], [["前払金", 10000], ["買掛金", 30000]]);
  await next();
  await predict();
  await next();
  await work.getByPlaceholder(/^金額\(/).fill("315000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next();

  // ステップ8: 未収入金と未払金、前払金と前受金をそれぞれ入れ替える
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [
    ["未収入金", "負債"],
    ["未払金", "資産"],
    ["前払金", "負債"],
    ["前受金", "資産"],
  ]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status).toContainText("未収入金と未払金の取り違え");
  await expect(status).toContainText("前払金と前受金の取り違え");
});
