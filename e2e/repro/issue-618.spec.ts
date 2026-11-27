import { expect, test } from "@playwright/test";

// 「商品以外の後払いと手付金」ステップ4で科目欄に「手付金」と打つと、候補が0件で「という科目はありません」と出た。
// 手付金は払った側なら前払金、受け取った側なら前受金なので、両方を候補に出し、どちらにも勝手に確定させない
test("科目欄に手付金と打つと前払金と前受金が候補に並び、勝手に確定しない", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });

  // ステップ2
  await next.click();
  await work.getByLabel("借方の科目1").fill("未収入金");
  await work.getByLabel("借方の金額1").fill("50000");
  await work.getByLabel("貸方の科目1").fill("備品");
  await work.getByLabel("貸方の金額1").fill("50000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next.click();

  // ステップ3
  for (const [element, value] of [
    ["資産", "増える"],
    ["負債", "増える"],
    ["純資産", "変わらない"],
    ["収益", "変わらない"],
    ["費用", "変わらない"],
  ]) {
    await work.getByLabel(`${element}の予想`, { exact: true }).selectOption({ label: value });
  }
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();

  // ステップ4
  const field = work.getByLabel("借方の科目1");
  const candidates = page.getByRole("listbox", { name: "科目の候補" });
  await field.pressSequentially("手付金");
  await expect(candidates.getByRole("option", { name: /前払金/ })).toBeVisible();
  await expect(candidates.getByRole("option", { name: /前受金/ })).toBeVisible();
  await expect(candidates.getByRole("option")).toHaveCount(2);

  // Tabで抜けても「手付金」のままで、どちらの科目にも確定しない。「という科目はありません」も出ない
  await field.press("Tab");
  await expect(field).toHaveValue("手付金");
  await expect(work.getByText("という科目はありません")).toHaveCount(0);

  // 候補から前払金を選べば記帳まで進める
  await field.click();
  await candidates.getByRole("option", { name: /前払金/ }).click();
  await expect(field).toHaveValue("前払金");
  await work.getByLabel("借方の金額1").fill("10000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("10000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
});
