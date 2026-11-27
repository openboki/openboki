import { expect, test, type Page } from "@playwright/test";

// 「ヴェネツィア式とパチョーリ」で絹の口に書くところを胡椒の口に書く、かかった額100を利益と損失へ移すと、
// 誤解の説明が付かず汎用文だけが出た(Issue #613)
type Line = [string, string];
const unit = "/units/birth-of-double-entry/venetian-method-and-pacioli";

async function post(page: Page, debit: Line, credit: Line) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(debit[1]);
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(credit[1]);
  await work.getByRole("button", { name: "記帳する" }).click();
}

test("口の取り違えとかかった額の振替に誤解の説明が付く", async ({ page }) => {
  await page.goto(unit);
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const status = page.getByRole("status");
  const done = status.filter({ hasText: "できました" });
  const miss = status.filter({ hasText: "もう一歩" });
  await next.click();
  await next.click();

  // ステップ3: 胡椒の口に書く
  await post(page, ["胡椒(アレクサンドリア航海)", "100"], ["ニッコロ", "100"]);
  await expect(miss).toBeVisible();
  await expect(miss).toContainText("航海の口を取り違える");
  await post(page, ["絹(フランドル航海)", "100"], ["ニッコロ", "100"]);
  await expect(done).toBeVisible();

  // ステップ5: 絹の口のもうけ
  await next.click();
  await next.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByPlaceholder("金額(ドゥカート)").fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();

  // ステップ6: 胡椒の口から移す / かかった額100を移す
  await post(page, ["胡椒(アレクサンドリア航海)", "30"], ["利益と損失", "30"]);
  await expect(miss).toContainText("航海の口を取り違える");
  await post(page, ["絹(フランドル航海)", "100"], ["利益と損失", "100"]);
  await expect(miss).toContainText("かかった額がもうけ");
});
