import { expect, test } from "@playwright/test";

// Issue #301: トップページに最初の導線が無く、どこから始めるかが決まらなかった。
// 初めての人にはチュートリアル、進捗がある人には学習中の単元への「続きから」を出す

test("初めての人にはチュートリアルへのボタンを出し、閲覧だけでは匿名ユーザーを作らない", async ({ page, context }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "チュートリアルを始める" })).toBeVisible();
  await expect(main.getByRole("link", { name: /^続きから/ })).toHaveCount(0);
  expect((await context.cookies()).filter((c) => c.name.startsWith("sb-"))).toEqual([]);

  await main.getByRole("link", { name: "チュートリアルを始める" }).click();
  await expect(page).toHaveURL(/\/units\/tutorial\/first-entry$/);
});

test("学習中の単元があると「続きから」でその単元へ戻れる", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry");
  await page.getByRole("dialog", { name: "チュートリアル" }).getByRole("button", { name: "スキップ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("100000");
  // 進捗は回答の保存の後に書かれる。書き終わる前に離れると「学習中」が残らない
  const progressSaved = page.waitForResponse((r) => r.url().includes("/unit_progress") && r.request().method() === "POST");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await progressSaved;

  await page.goto("/");
  const resume = page.getByRole("main").getByRole("link", { name: "続きから: はじめての記帳" });
  await expect(resume).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "チュートリアルを始める" })).toHaveCount(0);
  await resume.click();
  await expect(page).toHaveURL(/\/units\/tutorial\/first-entry$/);
});

test("幅390pxでボタンが画面からはみ出さない", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("main").getByRole("link", { name: "チュートリアルを始める" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
