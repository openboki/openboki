import { type Page, expect, test } from "@playwright/test";

// 航海の儲けと複式の発見で、胡椒とワインの航海の口を取り違えると、
// 「どのページに書くかを見直しましょう」の汎用文だけが出ていた

const generic = "どのページに書くかを見直しましょう";

async function fill(work: ReturnType<Page["getByRole"]>, side: "借方" | "貸方", account: string, amount: string) {
  await work.getByLabel(`${side}の科目1`).fill(account);
  await work.getByLabel(`${side}の金額1`).fill(amount);
}

// ステップ6(写し忘れを見つける)まで進め、写し忘れた行を選んだ状態にする
async function openStep6(page: Page) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByPlaceholder(/金額/).fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await next.click();
  await next.click();
  await fill(work, "借方", "ジョヴァンニ", "60");
  await fill(work, "貸方", "胡椒(アレクサンドリア航海)", "60");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await work.getByRole("radio").nth(2).check();
  return { work, next };
}

test("ステップ7でワインの口からもうけを移すと、胡椒の口を指す誤解の説明が出る", async ({ page }) => {
  const { work, next } = await openStep6(page);
  const status = page.getByRole("status");
  await fill(work, "借方", "ジョヴァンニ", "50");
  await fill(work, "貸方", "ワイン(クレタ航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  await fill(work, "借方", "ワイン(クレタ航海)", "30");
  await fill(work, "貸方", "元手", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  const wrong = status.filter({ hasText: "もう一歩" });
  await expect(wrong).toBeVisible();
  await expect(wrong).toContainText("よくある思い込み");
  await expect(wrong).toContainText("胡椒");
  await expect(status.filter({ hasText: generic })).toHaveCount(0);
});

// debugのwrong_patternsは行の選び間違い(index)しか書けないので、velite.config.tsのスキーマを広げるまで保留
test.fixme("ステップ6で写し忘れた行の右を胡椒にすると、ワインの口を指す誤解の説明が出る", async ({ page }) => {
  const { work } = await openStep6(page);
  const status = page.getByRole("status");
  await fill(work, "借方", "ジョヴァンニ", "50");
  await fill(work, "貸方", "胡椒(アレクサンドリア航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status.filter({ hasText: "もう一歩" })).toBeVisible();
  await expect(status.filter({ hasText: generic })).toHaveCount(0);
});
