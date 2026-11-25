import { expect, test, type Page } from "@playwright/test";

// 「ヴェネツィア式とパチョーリ」ステップ8で、損を引き忘れて30を元手へ移すと、
// 説明は出るが「よくある思い込み」(誤解)が付かなかった(Issue #598)
type Line = [string, string];

async function post(page: Page, debit: Line, credit: Line) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(debit[1]);
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(credit[1]);
  await work.getByRole("button", { name: "記帳する" }).click();
}

test("もうけの振替で損を引き忘れた30に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const next = page.getByRole("button", { name: "次へ →" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await next.click();
  await next.click();
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});

  // ステップ3: 右を現金にすると、掛けで買っても現金が減る誤解が付く
  await post(page, ["絹(フランドル航海)", "100"], ["現金", "100"]);
  await expect(status).toContainText("まだ払っていません");
  await expect(status).toContainText("よくある思い込み");
  await post(page, ["絹(フランドル航海)", "100"], ["ニッコロ", "100"]);
  await expect(done).toBeVisible();
  await next.click();
  await next.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder("金額(ドゥカート)").fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  await post(page, ["絹(フランドル航海)", "30"], ["利益と損失", "30"]);
  await expect(done).toBeVisible();
  await next.click();
  await next.click();

  // ステップ8: 絹のもうけ30だけを元手へ移す(胡椒の損10を引き忘れる)
  await post(page, ["利益と損失", "30"], ["元手", "30"]);
  await expect(status).toContainText("30は絹のもうけだけです");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("損を引かずに今年のもうけ");
});
