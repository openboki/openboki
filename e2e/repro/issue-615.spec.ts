import { expect, test } from "@playwright/test";

// 「5つの要素と仕訳」ステップ6で、家賃を現金で払った仕訳の右を未払金・買掛金にすると、
// 借入金と同じ取り違えなのに「よくある思い込み」(誤解)が付かず汎用文だけが出た(Issue #615)
test("家賃の右を未払金・買掛金にした誤答に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const next = page.getByRole("button", { name: "次へ →" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await next.click();
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const post = async (dr: string, cr: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(dr);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(cr);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
  };

  // ステップ2〜5を正解で進める(ステップ3は資産「変わらない」)
  await post("現金", "資本金", "1000000");
  await next.click();
  await work.getByLabel("資産の予想").selectOption("変わらない");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next.click();
  await post("現金", "借入金", "300000");
  await next.click();
  await post("現金", "売上", "80000");
  await next.click();

  // ステップ6: 右を未払金、買掛金と書く
  for (const [cr, phrase] of [
    ["未払金", "未払金は"],
    ["買掛金", "買掛金は"],
  ] as const) {
    await post("支払家賃", cr, "50000");
    const status = page.getByRole("status").filter({ hasText: "もう一歩" });
    await expect(status).toContainText(phrase);
    await expect(status).toContainText("右は現金");
    await expect(status).toContainText("よくある思い込み");
    await expect(status).toContainText("費用と負債の混同");
  }
});
