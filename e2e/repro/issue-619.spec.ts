import { devices, expect, test } from "@playwright/test";

// Issue #619: スマホで下段の「費用」の箱へ長押しドラッグすると、自動スクロールで箱が指から逃げて入らなかった

const { defaultBrowserType: _ignored, ...iphone } = devices["iPhone 13"];
test.use({ ...iphone });

const UNIT = "/units/merchandise/three-account-method";

test("390pxで下段の箱へ長押しドラッグすると、ページが動かずに箱へ入る", async ({ page, context }) => {
  await page.goto(UNIT);
  const tab = (name: string) => page.getByRole("tab", { name }).click();
  const next = async () => {
    await tab("ガイド");
    await page.getByRole("button", { name: "次へ →" }).click({ timeout: 15000 });
    await tab("ワークスペース");
  };
  const done = () => expect(page.getByRole("status").getByText("できました", { exact: true })).toBeVisible();
  const post = async (debit: string, credit: string, amount: string) => {
    await page.getByLabel("借方の科目1").fill(debit);
    await page.getByLabel("借方の金額1").fill(amount);
    await page.getByLabel("貸方の科目1").fill(credit);
    await page.getByLabel("貸方の金額1").fill(amount);
    await page.getByRole("button", { name: "記帳する" }).click();
    await done();
  };
  await next();
  await post("仕入", "現金", "30000");
  await next();
  for (const [name, v] of [["資産", "decrease"], ["負債", "none"], ["純資産", "decrease"], ["収益", "none"], ["費用", "increase"]]) {
    await page.getByLabel(`${name}の予想`, { exact: true }).selectOption(v);
  }
  await page.getByRole("button", { name: "予想して記帳する" }).click();
  await done();
  await next();
  await post("現金", "売上", "90000");
  await next();
  await page.getByPlaceholder("金額(円)").fill("40000");
  await page.getByRole("button", { name: "確認する" }).click();
  await done();
  await next();
  await page.evaluate(() => scrollTo(0, 0));

  const board = page.getByRole("group", { name: "仕分けボード" });
  const center = async (name: string) => {
    const b = (await board.getByRole("button", { name, exact: true }).boundingBox())!;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  const from = await center("仕入");
  const to = await center("費用");
  // 箱が画面の下20%に入っていることが前提(自動スクロールの範囲)
  expect(to.y).toBeGreaterThan(664 * 0.8);
  // 長押しからの指の移動を、CDPで実タッチと同じ経路から送る
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  await page.waitForTimeout(400);
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + ((to.x - from.x) * i) / 10, y: from.y + ((to.y - from.y) * i) / 10 }] });
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(20);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByText("仕入を費用に入れました")).toBeAttached();
});
