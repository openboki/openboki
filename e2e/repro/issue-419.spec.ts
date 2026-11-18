import { expect, test } from "@playwright/test";

// Issue #419: 胡椒の口のもうけを元手へ移すステップで、かかった額150や代金だけ引いた60を移す誤答に、
// 直前のcalcと同じ説明が付かず「金額をもう一度確かめましょう」の汎用文だけが出ていた
test("かかった額や代金だけ引いた額を移すと、calcと同じ取り違えの説明が出る", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const fill = async (d: string, da: string, c: string, ca: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(da);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(ca);
    await page.keyboard.press("Tab");
  };
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await expect(page.getByText("ステップ2 / 9")).toBeVisible();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await fill("ジョヴァンニ", "60", "胡椒(アレクサンドリア航海)", "60");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  // debug: 3行目を選び、貸方にワインを足す
  await work.getByRole("radio").nth(2).check();
  await fill("ジョヴァンニ", "50", "ワイン(クレタ航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();

  // かかった額の合計150を移す
  await fill("胡椒(アレクサンドリア航海)", "150", "元手", "150");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("金額をもう一度確かめましょう");
  await expect(status).toContainText("150はかかった額の合計です");

  // 代金120だけを引いた60を移す
  await fill("胡椒(アレクサンドリア航海)", "60", "元手", "60");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("金額をもう一度確かめましょう");
  await expect(status).toContainText("運賃20と関税10");
  await expect(page.getByText("よくある思い込み: 運賃と関税を引かない")).toBeVisible();
});
