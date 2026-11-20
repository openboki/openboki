import { devices, expect, test } from "@playwright/test";

const { defaultBrowserType: _ignored, ...iPhone } = devices["iPhone 13"];
test.use({ ...iPhone });

// Issue #453: 計算欄がinputmode=numericで、iOSのテンキーでは負号(- / ー / △)を打てなかった
test("負の答えを求める計算欄は、スマホのキーボードでも負号を打てる", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/depreciation/what-is-depreciation");
  await page.getByRole("button", { name: "今はしない" }).click();
  await next.click();
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const answers = { 資産の予想: "decrease", 負債の予想: "none", 純資産の予想: "decrease", 収益の予想: "none", 費用の予想: "increase" };
  for (const [label, value] of Object.entries(answers)) await work.getByLabel(label, { exact: true }).selectOption(value);
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ3 / 9")).toBeVisible();
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const input = work.getByPlaceholder("金額(円)");
  await expect(input).toBeVisible();
  // iOSではnumericもdecimalも数字(と小数点)だけのテンキーになり、- / ー / △ のキーが無い
  const mode = await input.getAttribute("inputmode");
  expect(["numeric", "decimal"]).not.toContain(mode);
  await input.fill("-260000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
});
