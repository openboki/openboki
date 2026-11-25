import { test, expect } from "@playwright/test";

// Issue #573: 本文とヘルプは「結果の表」「ワークスペースのタブ」と列の名前で場所を指すので、PCの3列にも列の名前を見せる
const URL = "/units/receivables-and-payables/other-receivables-and-payables";
const PANES = [
  ["pane-guide", "ガイド"],
  ["pane-work", "ワークスペース"],
  ["pane-result", "結果"],
] as const;

test.describe("1280px", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("3列それぞれの先頭に列の名前が見える", async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole("tablist", { name: "ペインの切り替え" })).toBeHidden();
    for (const [id, label] of PANES) {
      await expect(page.locator(`#${id}`).getByText(label, { exact: true })).toBeVisible();
    }
  });
});

test.describe("390px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("狭い画面ではタブ列だけが列の名前を出し、見出しが二重に出ない", async ({ page }) => {
    await page.goto(URL);
    for (const [id, label] of PANES) {
      await page.getByRole("tab", { name: label }).click();
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`).getByText(label, { exact: true })).toBeHidden();
    }
  });
});
