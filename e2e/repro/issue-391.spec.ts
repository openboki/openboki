import { test, expect, devices } from "@playwright/test";

const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];
test.use(iPhone);

// 行の一覧を包むfieldsetをdisabledにすると、行内の用語ボタンまで無効になっていた
test("debugを正解した後も、行の科目名から用語のポップオーバーを開ける", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  const skip = page.getByRole("button", { name: "今はしない" });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  const next = () => page.getByRole("button", { name: "次へ →" }).click();
  const tab = (name: string) => page.getByRole("tablist", { name: "ペインの切り替え" }).getByRole("tab", { name }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });

  await next();
  await tab("ワークスペース");
  await page.getByPlaceholder("金額(ドゥカート)").fill("30");
  await page.getByRole("button", { name: "確認する" }).click();
  await next();
  await next();
  await tab("ワークスペース");
  await work.getByLabel("借方の科目1").fill("ジョヴァンニ");
  await work.getByLabel("借方の金額1").fill("60");
  await work.getByLabel("貸方の科目1").fill("胡椒(アレクサンドリア航海)");
  await work.getByLabel("貸方の金額1").fill("60");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  await next();
  await next();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();

  await tab("ワークスペース");
  await work.getByRole("radio").nth(2).check();
  await work.getByLabel("借方の科目1").fill("ジョヴァンニ");
  await work.getByLabel("借方の金額1").fill("50");
  await work.getByLabel("貸方の科目1").fill("ワイン(クレタ航海)");
  await work.getByLabel("貸方の金額1").fill("50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();

  await tab("ワークスペース");
  // 正解後に行を選び直せない挙動は保つ
  for (const radio of await work.getByRole("radio").all()) await expect(radio).toBeDisabled();
  const term = work.locator("label").filter({ has: page.getByRole("radio") }).first().getByRole("button", { name: "現金" });
  await expect(term).toBeEnabled();
  await term.tap();
  await expect(page.getByRole("dialog", { name: "現金" })).toBeVisible();
});
