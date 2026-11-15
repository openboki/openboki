import { expect, test } from "@playwright/test";

// Issue #321: もうけの振替で相手を現金にしたときの説明が「現金は代金を受け取ったときに、すでに動いています」と言うが、
// どちらの単元も売上は人名勘定に書かれ、現金で代金を受け取っていない

test("ヴェネツィア式のステップ8で現金を選んだときの説明が帳簿と矛盾しない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const post = async (debit: string, credit: string, amount: number) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill(String(amount));
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill(String(amount));
    await work.getByRole("button", { name: "記帳する" }).click();
  };
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 /")).toBeVisible();
  await post("絹(フランドル航海)", "ニッコロ", 100);
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ5 /")).toBeVisible();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await post("絹(フランドル航海)", "利益と損失", 30);
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ8 /")).toBeVisible();
  await post("利益と損失", "現金", 20);
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  // この単元の現金は期首の390のまま動いていない
  await expect(page.getByRole("region", { name: "結果" }).getByRole("row", { name: /現金/ }).first()).toContainText("390");
  await expect(status).not.toContainText("すでに動いて");
  await expect(status).toContainText("元手");
});

test("航海の儲けと複式の発見のステップ7で現金を選んだときの説明が帳簿と矛盾しない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const fill = async (debit: string, credit: string, amount: number) => {
    await work.getByLabel("借方の科目1").fill(debit);
    await work.getByLabel("借方の金額1").fill(String(amount));
    await work.getByLabel("貸方の科目1").fill(credit);
    await work.getByLabel("貸方の金額1").fill(String(amount));
  };
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await next.click();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await fill("ジョヴァンニ", "胡椒(アレクサンドリア航海)", 60);
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await work.getByRole("radio").nth(2).check();
  await fill("ジョヴァンニ", "ワイン(クレタ航海)", 50);
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  await fill("胡椒(アレクサンドリア航海)", "現金", 30);
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  // 胡椒の売上180は人名勘定に書かれていて、現金で受け取った代金は無い
  await expect(status).not.toContainText("すでに動いて");
  await expect(status).toContainText("元手");
});
