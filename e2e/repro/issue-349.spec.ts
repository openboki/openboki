import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("歴史の単元の試算と元帳(T勘定)で科目が同じ順に並ぶ", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const later = page.getByRole("button", { name: "今はしない" });
  if (await later.count()) await later.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("絹(フランドル航海)");
  await work.getByLabel("借方の金額1").fill("100");
  await work.getByLabel("貸方の科目1").fill("ニッコロ");
  await work.getByLabel("貸方の金額1").fill("100");
  await work.getByRole("button", { name: "記帳する" }).click();
  await page.getByRole("tab", { name: "結果" }).click();

  const trial = page.getByRole("region", { name: "試算" });
  const ledger = page.getByRole("region", { name: "元帳" });
  const names = ["現金", "ニッコロ", "絹(フランドル航海)", "胡椒(アレクサンドリア航海)", "元手"];
  const trialOrder = await trial.locator("tbody tr").evaluateAll((rows) => rows.map((r) => r.firstElementChild?.textContent?.trim() ?? ""));
  // 摘要に「ニッコロから…」と科目名が出るので、本文の文字列ではなくT勘定の科目名ボタンの順を見る
  const ledgerOrder = (await ledger.getByRole("button").allInnerTexts()).map((t) => t.trim()).filter((n) => names.includes(n));
  expect(ledgerOrder).toEqual(trialOrder.filter((n) => names.includes(n)));
  // 資産のあとに負債、純資産の順でまとまる
  expect(trialOrder.filter((n) => names.includes(n))).toEqual(["現金", "絹(フランドル航海)", "胡椒(アレクサンドリア航海)", "ニッコロ", "元手"]);
});
