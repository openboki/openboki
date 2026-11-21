import { expect, test } from "@playwright/test";

// useReducedMotionはサーバーでfalse、クライアントの初回描画でtrueを返す。これで描画を分岐させるとhydrationが食い違う
test("reduced motionで単元を開いてもhydrationが失敗せず、記帳して正解できる", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  expect(errors.filter((e) => /Hydration failed|didn't match/.test(e))).toEqual([]);

  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await expect(page.locator("[data-celebration]")).toHaveCount(0);
  expect(errors.filter((e) => /Hydration failed|didn't match/.test(e))).toEqual([]);
});
