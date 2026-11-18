import { expect, test } from "@playwright/test";

// 新しいタブで開き、進捗の読み込みが終わる前に「次へ →」で正解済みのステップへ進むと、未回答のまま残る
const UNIT = "/units/depreciation/straight-line";

test("読み込み前に「次へ →」で入った正解済みのステップも、読み込み後は正解済みになる", async ({ page }) => {
  await page.goto(UNIT);
  await page.getByRole("button", { name: "今はしない" }).click();
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("車両運搬具");
  await work.getByLabel("借方の金額1").fill("1200000");
  await work.getByLabel("貸方の科目1").fill("現金");
  await work.getByLabel("貸方の金額1").fill("1200000");
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/unit_progress") && r.request().method() === "POST"),
    work.getByRole("button", { name: "記帳する" }).click(),
  ]);
  await expect(page.getByText("できました", { exact: true })).toBeVisible();

  // 新しいタブで開いた状態にし、進捗の読み込みを遅らせて「次へ →」を先に押す
  await page.evaluate(() => sessionStorage.clear());
  await page.route("**/rest/v1/**", async (route) => {
    if (route.request().method() === "GET") await new Promise((r) => setTimeout(r, 2000));
    await route.continue();
  });
  await page.reload();
  await expect(page.getByText("ステップ1 / 9")).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ2 / 9")).toBeVisible();

  await expect(next).not.toHaveAttribute("aria-disabled", "true", { timeout: 10_000 });
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await work.getByRole("tab", { name: /仕訳帳/ }).click();
  await expect(work.getByText("車両運搬具 1,200,000")).toBeVisible();
});
