import { expect, test } from "@playwright/test";

// 固定資産の売却で、借方に未払金を書く(ステップ5)・売却益と売却損の箱を入れ替える(ステップ6)と、
// 単元に誤解があるのに「よくある思い込み」が出ず汎用文だけが出ていた
test("固定資産の売却で未払金・売却益と売却損の取り違えに誤解が付く", async ({ page }) => {
  await page.goto("/units/depreciation/sale-of-fixed-assets");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const work = page.getByRole("region", { name: "ワークスペース" });
  const status = page.getByRole("status");
  const next = page.getByRole("button", { name: "次へ →" });
  // e2e/learning-loop.spec.tsと同じ手順で、残っている行を消してから入れる
  const entry = async (debit: [string, number][], credit: [string, number][]) => {
    const removable = work.locator("button[aria-label='行を削除']:not([disabled])");
    while ((await removable.count()) > 0) await removable.first().click();
    for (const [side, lines] of [
      ["借方", debit],
      ["貸方", credit],
    ] as const) {
      for (const [i, [account, amount]] of lines.entries()) {
        if (i > 0)
          await work
            .getByRole("button", { name: "行を追加" })
            .nth(side === "借方" ? 0 : 1)
            .click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(account);
        await work.getByLabel(`${side}の金額${i + 1}`).fill(String(amount));
      }
    }
    await page.getByRole("button", { name: "記帳する" }).click();
  };

  await next.click();
  await page.getByPlaceholder("金額(円)").fill("900000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await entry(
    [
      ["現金", 850000],
      ["車両運搬具減価償却累計額", 300000],
      ["固定資産売却損", 50000],
    ],
    [["車両運搬具", 1200000]],
  );
  await expect(status.getByText("できました")).toBeVisible();
  await next.click();
  await page.getByPlaceholder("金額(円)").fill("30000");
  await page.getByRole("button", { name: "確認する" }).click();
  await next.click();

  // ステップ5: 借方を未払金にする
  await entry(
    [
      ["未払金", 480000],
      ["備品減価償却累計額", 150000],
    ],
    [
      ["備品", 600000],
      ["固定資産売却益", 30000],
    ],
  );
  await expect(status.getByText("よくある思い込み: 未収入金と未払金の取り違え")).toBeVisible();

  await entry(
    [
      ["未収入金", 480000],
      ["備品減価償却累計額", 150000],
    ],
    [
      ["備品", 600000],
      ["固定資産売却益", 30000],
    ],
  );
  await expect(status.getByText("できました")).toBeVisible();
  await next.click();
  await page.getByRole("button", { name: "わかった" }).click({ timeout: 2000 }).catch(() => {});

  // ステップ6: 売却益と売却損の箱を入れ替える
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [
    ["固定資産売却益", "費用"],
    ["固定資産売却損", "収益"],
    ["未収入金", "資産"],
    ["備品減価償却累計額", "資産"],
  ]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  await page.getByRole("button", { name: "確認する" }).click();
  await expect(status.getByText("よくある思い込み: 売却益と売却損の取り違え")).toBeVisible();
});
