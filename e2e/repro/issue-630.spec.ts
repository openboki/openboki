import { expect, test, type Page } from "@playwright/test";

// 「航海の儲けと複式の発見」で、かかった額150をもうけと答えても(ステップ2)、150を元手へ移しても(ステップ7)、
// 誤解「かかった額がもうけ」があるのに説明文だけが出て「よくある思い込み」が付かなかった(Issue #630)
type Line = [string, string];

async function post(page: Page, debit: Line, credit: Line, button = "記帳する") {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(debit[1]);
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(credit[1]);
  await page.keyboard.press("Escape");
  await work.getByRole("button", { name: button }).click();
}

test("かかった額150をもうけとする誤答に誤解の説明が付く(航海の儲けと複式の発見 ステップ2・7)", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const wrong = page.getByRole("status").filter({ hasText: "もう一歩" });
  await next.click();
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 3000 }).catch(() => {});

  // ステップ2: かかった額の合計150を答える
  await work.getByPlaceholder("金額(ドゥカート)").fill("150");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(wrong).toContainText("150はかかった額の合計です");
  await expect(wrong).toContainText("よくある思い込み: かかった額がもうけ");

  await work.getByPlaceholder("金額(ドゥカート)").fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  await next.click();

  // ステップ4: 代金を受け取っていないのに左を現金にする
  await post(page, ["現金", "60"], ["胡椒(アレクサンドリア航海)", "60"]);
  await expect(wrong).toContainText("よくある思い込み: 後払いで売っても現金が増える");
  await post(page, ["ジョヴァンニ", "60"], ["胡椒(アレクサンドリア航海)", "60"]);
  await expect(done).toBeVisible();
  await next.click();
  await next.click();
  await work.getByRole("radio").nth(2).check();
  await post(page, ["ジョヴァンニ", "50"], ["ワイン(クレタ航海)", "50"], "確認する");
  await expect(done).toBeVisible();
  await next.click();

  // ステップ7: かかった額150を元手へ移す
  await post(page, ["胡椒(アレクサンドリア航海)", "150"], ["元手", "150"]);
  await expect(wrong).toContainText("150はかかった額の合計です");
  await expect(wrong).toContainText("よくある思い込み: かかった額がもうけ");
});
