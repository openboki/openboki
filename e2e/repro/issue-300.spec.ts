import { expect, test } from "@playwright/test";

// 歴史の単元では、エディタ下のチップと想定外の誤答の文も5要素の言葉で出さない(#274の続き)
test("航海の儲けと複式の発見 ステップ7で5要素のチップと汎用文を出さない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  const fill = async (d: string, da: string, c: string, ca: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(da);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(ca);
  };
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await next.click();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await fill("ジョヴァンニ", "60", "胡椒(アレクサンドリア航海)", "60");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await work.getByRole("radio").nth(2).check();
  await fill("ジョヴァンニ", "50", "ワイン(クレタ航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  await fill("胡椒(アレクサンドリア航海)", "30", "元手", "30");
  await expect(work.getByText(/資産 \+30/)).toHaveCount(0);
  await fill("胡椒(アレクサンドリア航海)", "30", "ジョヴァンニ", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  await expect(status).toBeVisible();
  await expect(status).not.toContainText("結果の表");
});
