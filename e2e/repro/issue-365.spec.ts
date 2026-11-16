import { expect, test } from "@playwright/test";

// Issue #365: Cookieが消えた後にreloadすると、途中経過(sessionStorage)でステップ3に戻るが、次の回答で作られた新しいゲストには進捗が残らなかった

const unit = "/units/bookkeeping-basics/five-elements";

test("Cookieが消えてreloadした後の最初の回答で、新しいゲストにもいまの位置の進捗が残る", async ({ context, page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto(unit);
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  const saved = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/unit_progress"));
  await page.getByRole("button", { name: "次へ →" }).click();
  await saved;
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();

  await context.clearCookies();
  await page.reload();
  // 途中経過はsessionStorageに残るので、同じタブはステップ3のまま開く
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  const selects = work.locator("select");
  for (let i = 0; i < (await selects.count()); i++) await selects.nth(i).selectOption("none");
  const attempt = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/attempts"));
  const progress = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/rest/v1/unit_progress"));
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  expect((await attempt).status()).toBe(201);
  await progress;

  const other = await context.newPage();
  await other.goto(unit);
  await expect(other.getByText("前回はステップ3まで進みました。")).toBeVisible();
  await other.goto("/");
  await expect(other.getByRole("main").getByRole("link", { name: "続きから: 5つの要素と仕訳" })).toBeVisible();
});
