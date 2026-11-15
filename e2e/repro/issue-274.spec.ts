import { expect, test } from "@playwright/test";

// Issue #274: 歴史の単元(ページの左右で学ぶ)で、もうけを元手へ移す振替に誤答すると
// 5要素の比較表が「資産+30」を期待される動きとして出し、「もうけで財産が増える」と読めていた

const compareTable = (page: import("@playwright/test").Page) => page.getByRole("table").filter({ hasText: "期待される動き" });

test("航海の儲けと複式の発見 ステップ7の貸借逆に5要素の比較表を出さない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const fill = async (d: string, da: string, c: string, ca: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(da);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(ca);
  };
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await next.click();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await fill("ジョヴァンニ", "60", "胡椒(アレクサンドリア航海)", "60");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await work.getByRole("radio").nth(2).check();
  // 正しい行で貸方を現金にすると5要素の動きが同じになり、以前は5要素の汎用文が出ていた
  await fill("ジョヴァンニ", "50", "現金", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  const debugStatus = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(debugStatus).toBeVisible();
  await expect(debugStatus).not.toContainText("5つの要素");
  await expect(debugStatus).toContainText("どのページに書くか");
  await expect(compareTable(page)).toHaveCount(0);
  await fill("ジョヴァンニ", "50", "ワイン(クレタ航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  await fill("元手", "30", "胡椒(アレクサンドリア航海)", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(compareTable(page)).toHaveCount(0);
  await expect(page.getByText("+30")).toHaveCount(0);
});

test("ヴェネツィア式とパチョーリ ステップ6・8の誤答に5要素の比較表を出さない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const fill = async (d: string, da: string, c: string, ca: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(da);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(ca);
  };
  const post = async (d: string, da: string, c: string, ca: string) => {
    await fill(d, da, c, ca);
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  };
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 /")).toBeVisible();
  await post("絹(フランドル航海)", "100", "ニッコロ", "100");
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ5 /")).toBeVisible();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await expect(page.getByText("ステップ6 /")).toBeVisible();
  await fill("利益と損失", "30", "絹(フランドル航海)", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("もう一歩")).toBeVisible();
  await expect(compareTable(page)).toHaveCount(0);
  await post("絹(フランドル航海)", "30", "利益と損失", "30");
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ8 /")).toBeVisible();
  await fill("利益と損失", "30", "元手", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toContainText("30は絹のもうけだけです");
  await expect(compareTable(page)).toHaveCount(0);
});
