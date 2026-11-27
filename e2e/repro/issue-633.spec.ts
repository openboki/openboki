import { expect, test, type Page } from "@playwright/test";

// 「仕入と売上」で、豆を消耗品費にしても(ステップ2)、売ったときに右を仕入にしても(ステップ4)、
// 説明文だけが出て「よくある思い込み」が付かなかった(Issue #633)
type Line = [string, string];

async function post(page: Page, debit: Line, credit: Line) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(debit[1]);
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(credit[1]);
  await page.keyboard.press("Escape");
  await work.getByRole("button", { name: "記帳する" }).click();
}

test("豆を消耗品費にする・売ったときに右を仕入にする誤答に誤解の説明が付く(仕入と売上 ステップ2・4)", async ({ page }) => {
  await page.goto("/units/merchandise/three-account-method");
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const wrong = page.getByRole("status").filter({ hasText: "もう一歩" });
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 3000 }).catch(() => {});
  await next.click();

  // ステップ2: 売り物の豆を消耗品費にする
  await post(page, ["消耗品費", "30000"], ["現金", "30000"]);
  await expect(wrong).toContainText("売り物の豆は仕入です");
  await expect(wrong).toContainText("よくある思い込み: 売り物も消耗品費");
  await post(page, ["仕入", "30000"], ["現金", "30000"]);
  await expect(done).toBeVisible();
  await next.click();

  // ステップ3: 純資産を「変わらない」と予想するのは見落としで、誤解は付かない
  const pick = { 資産: "減る", 負債: "変わらない", 純資産: "変わらない", 収益: "変わらない", 費用: "増える" };
  for (const [el, label] of Object.entries(pick)) await work.getByLabel(`${el}の予想`, { exact: true }).selectOption({ label });
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(wrong).toContainText("純資産も減ります");
  await expect(wrong).not.toContainText("よくある思い込み");
  await next.click();

  // ステップ4: 売ったときに右を仕入にする
  await post(page, ["現金", "90000"], ["仕入", "90000"]);
  await expect(wrong).toContainText("売ったときに仕入を減らす必要はありません");
  await expect(wrong).toContainText("よくある思い込み: 仕入は資産");
});
