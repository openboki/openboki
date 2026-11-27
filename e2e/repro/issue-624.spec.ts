import { expect, test, type Page } from "@playwright/test";

// 「貸したお金、借りたお金」で、普通預金を当座預金と書く誤答と、2%を0.002とした利息300に誤解が付かず、
// ステップ3の予想の誤答では説明文が重なる(Issue #624)
async function post(page: Page, debit: [string, string], credit: [string, string]) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit[0]);
  await work.getByLabel("借方の金額1").fill(debit[1]);
  await work.getByLabel("貸方の科目1").fill(credit[0]);
  await work.getByLabel("貸方の金額1").fill(credit[1]);
  await work.getByRole("button", { name: "記帳する" }).click();
}

test("貸したお金の単元で、当座預金の取り違えと%の桁違いに誤解が付き、予想の説明が重ならない", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/loans");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const done = page.getByRole("status").filter({ hasText: "できました" });

  // ステップ2: 右を当座預金にすると「預金はどれも同じ科目」
  await next.click();
  await post(page, ["貸付金", "100000"], ["当座預金", "100000"]);
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("預金はどれも同じ科目");

  await post(page, ["貸付金", "100000"], ["普通預金", "100000"]);
  await expect(done).toBeVisible();
  await next.click();

  // ステップ3: 資産と収益を「変わらない」にすると、説明は貸付金が減る誤解の1文だけ
  const picks: Record<string, string> = { 資産: "変わらない", 負債: "変わらない", 純資産: "増える", 収益: "変わらない", 費用: "変わらない" };
  for (const [name, label] of Object.entries(picks)) await page.getByLabel(`${name}の予想`, { exact: true }).selectOption({ label });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("受取利息という収益が増えます");
  await expect(status).not.toContainText("貸付金は減りませんが");
  await next.click();

  // ステップ4: 右を当座預金にしても同じ誤解
  await post(page, ["支払利息", "3000"], ["当座預金", "3000"]);
  await expect(status).toContainText("預金はどれも同じ科目");
  await post(page, ["支払利息", "3000"], ["普通預金", "3000"]);
  await expect(done).toBeVisible();
  await next.click();

  // ステップ5: 2%を0.002とした300にも%の桁違いの誤解
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByRole("textbox").first().fill("300");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("%を小数に直すときの桁違い");
  await work.getByRole("textbox").first().fill("3000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();

  // ステップ6: 左を当座預金にしても同じ誤解
  await post(page, ["当座預金", "100000"], ["貸付金", "100000"]);
  await expect(status).toContainText("預金はどれも同じ科目");
});
