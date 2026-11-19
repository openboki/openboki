import { expect, test, type Page } from "@playwright/test";

// Issue #441: 進捗を読み込む前のトップは「チュートリアルを始める」を出していて、
// 学習中・完了済みのゲストが表示直後に押すとツアーへ飛ばされていた

// 一度でも?tour=1のリンクがDOMに現れたかを、SSRのHTMLの解析中から記録する
async function watchTourLink(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { tourLinkSeen: boolean };
    w.tourLinkSeen = false;
    new MutationObserver(() => {
      if (document.querySelector('main a[href*="tour=1"]')) w.tourLinkSeen = true;
    }).observe(document, { childList: true, subtree: true });
  });
}

async function postCashOverAndShort(page: Page) {
  await page.goto("/units/cash-and-deposits/cash-over-and-short");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金過不足");
  await work.getByLabel("借方の金額1").fill("3000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("3000");
  await page.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status")).toContainText("できました");
  // 進捗の保存は記帳と並行して送られるので、終わるのを待ってからトップを開く
  await page.waitForLoadState("networkidle");
}

test("学習中のゲストには、進捗を読み込む前からチュートリアルのリンクを出さない", async ({ page }) => {
  await postCashOverAndShort(page);
  await watchTourLink(page);
  await page.goto("/", { waitUntil: "commit" });
  const resume = page.locator("main a", { hasText: "続きから: 金庫のお金が合わない" });
  await expect(resume).toHaveAttribute("href", "/units/cash-and-deposits/cash-over-and-short?resume=1", { timeout: 10_000 });
  expect(await page.evaluate(() => (window as unknown as { tourLinkSeen: boolean }).tourLinkSeen)).toBe(false);
  await expect(page.getByText("1件の仕訳を記帳して、画面の使い方を体験します。")).toHaveCount(0);
});

test("SSRのHTMLにはチュートリアルのリンクを入れない", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toContain("チュートリアルを始める");
});

test("進捗もセッションも無い閲覧者には、読み込み後にチュートリアルを出す", async ({ page }) => {
  await page.goto("/");
  const tutorial = page.locator("main a", { hasText: "チュートリアルを始める" });
  await expect(tutorial).toHaveAttribute("href", "/units/tutorial/first-entry?tour=1");
  await expect(page.getByText("1件の仕訳を記帳して、画面の使い方を体験します。")).toBeVisible();
  await expect(page.getByRole("button", { name: "読み込み中…" })).toHaveCount(0);
});
