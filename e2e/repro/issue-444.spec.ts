import { type Page, expect, test } from "@playwright/test";

// 期中の売却(ステップ4)で、減価償却費を書かずに累計額300,000を消した仕訳に「考え方は合っています」が出て、
// 積んでから消す合算形には「累計額に積んでいない」と逆のことを言っていた

async function openStep4(page: Page) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/depreciation/sale-during-period");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  for (const v of ["60000", "420000"]) {
    await next.click();
    await work.getByPlaceholder(/金額/).fill(v);
    await work.getByRole("button", { name: "確認する" }).click();
    await expect(page.getByText("できました", { exact: true })).toBeVisible();
  }
  await next.click();
  await expect(page.getByText("ステップ4 / 8")).toBeVisible();
  return work;
}

async function fillSide(work: ReturnType<Page["getByRole"]>, side: "借方" | "貸方", lines: [string, string][]) {
  for (const [i, [account, amount]] of lines.entries()) {
    if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
    await work.getByLabel(`${side}の科目${i + 1}`).fill(account);
    await work.getByLabel(`${side}の金額${i + 1}`).fill(amount);
  }
}

test("今年の減価償却費を落とした仕訳を「考え方は合っています」と言わない", async ({ page }) => {
  const work = await openStep4(page);
  await fillSide(work, "借方", [["現金", "400000"], ["備品減価償却累計額", "300000"], ["固定資産売却損", "20000"]]);
  await fillSide(work, "貸方", [["備品", "720000"]]);
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("考え方は合っています");
  await expect(status).toContainText("減価償却費にせず");
});

test("積んでから消す合算形に「累計額に積んでいない」と言わない", async ({ page }) => {
  const work = await openStep4(page);
  await fillSide(work, "借方", [["現金", "400000"], ["備品減価償却累計額", "300000"], ["減価償却費", "60000"], ["固定資産売却損", "20000"]]);
  await fillSide(work, "貸方", [["備品", "720000"], ["備品減価償却累計額", "60000"]]);
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("積んでいない");
  await expect(status).toContainText("合わせると");
});
