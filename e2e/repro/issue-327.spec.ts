import { expect, test, type Page } from "@playwright/test";

// チュートリアルが未完了で案内がオンなら、記録があってもバナーを出す。
// 出すのは、記録がチュートリアル単元だけのときと、「使い方」でチェックを付け直したとき

const bannerOf = (page: Page) => page.getByRole("note").filter({ hasText: "チュートリアルがまだ終わっていません" });

async function postInTour(page: Page) {
  await page.goto("/units/tutorial/first-entry?tour=1");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  const work = page.getByRole("region", { name: "ワークスペース" });
  await tour.getByRole("button", { name: "はじめる" }).click();
  await tour.getByRole("button", { name: "次へ" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("100000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("100000");
  // 「できました」は保存より先に出るので、保存を待たずに移動すると移動先にセッションも記録も無い(Issue #597)
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/attempts"));
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました").first()).toBeVisible();
  expect((await saved).ok()).toBe(true);
  return tour;
}

test("ツアーで記帳してスキップした後でも、チェックを付け直せば未着手の単元で案内が出る", async ({ page }) => {
  const tour = await postInTour(page);
  await tour.getByRole("button", { name: "スキップ" }).click();

  await page.getByRole("button", { name: "使い方", exact: true }).click();
  const setting = page.getByRole("checkbox", { name: "初めて単元を開いたときにチュートリアルを案内する" });
  await expect(setting).not.toBeChecked();
  await setting.check();
  await page.keyboard.press("Escape");

  await page.goto("/units/merchandise/cost-of-goods-sold");
  await expect(page.getByRole("region", { name: "ガイド" })).toBeVisible();
  await expect(bannerOf(page)).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: "初めてですか" })).toHaveCount(0);
});

test("ツアーで記帳して途中で離れると、未着手の単元でチュートリアルの続きを案内する", async ({ page }) => {
  await postInTour(page);
  await page.goto("/units/merchandise/three-account-method");
  await expect(bannerOf(page)).toBeVisible();
});

test("ほかの単元で答えた学習者が「使い方」でチェックを付け直すと案内が出る", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/attempts"));
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  expect((await saved).ok()).toBe(true);

  // チェックを付け直す前は、記録のある学習者に案内を出さない(Issue #69)
  const loaded = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "GET");
  await page.goto("/units/merchandise/three-account-method");
  await loaded;
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: /初めてですか|チュートリアルがまだ/ })).toHaveCount(0);

  await page.getByRole("button", { name: "使い方", exact: true }).click();
  await page.getByRole("checkbox", { name: "初めて単元を開いたときにチュートリアルを案内する" }).check();
  await page.keyboard.press("Escape");
  await expect(bannerOf(page)).toBeVisible();
});
