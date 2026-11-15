import { devices, expect, test } from "@playwright/test";

const { defaultBrowserType: _omit, ...iPhone } = devices["iPhone 13"];
test.use({ ...iPhone });

// 学習中のバッジが付いても、単元の説明文は未着手の単元と同じ幅で折り返す
test("390pxの単元一覧で学習中の単元の説明文が狭まらない", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "次へ →" }).first().click();
  await page.getByRole("tab", { name: "ワークスペース" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  // 進捗は回答の保存の後に書かれる。書き終わる前に離れると「学習中」が残らない
  const progressSaved = page.waitForResponse((r) => r.url().includes("/unit_progress") && r.request().method() === "POST");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await progressSaved;

  // bookkeeping-basicsは単元が1つだけなので、未着手の単元は別のテーマの1枚目と比べる
  await page.goto("/topics/birth-of-double-entry");
  const plain = await page.locator("main li p").first().boundingBox();
  await page.goto("/topics/bookkeeping-basics");
  await expect(page.getByText("学習中")).toBeVisible();
  const started = await page.locator("main li p").first().boundingBox();
  expect(started!.width).toBeGreaterThanOrEqual(plain!.width - 1);
});
