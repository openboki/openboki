import { expect, type BrowserContext, type Page, test } from "@playwright/test";
import { db } from "../../scripts/monkey/session.mjs";

const UNIT = "bookkeeping-basics/five-elements";
const STALE = "別のタブでこの単元を未完了に戻したため、このタブの進捗は保存しません。";

// Issue #528: 別のタブで未完了に戻した後、開いたままの古いタブがステップを移るたびに完了を書き戻していた
const userIdOf = async (context: BrowserContext) => {
  const token = (await context.cookies()).filter((c) => c.name.includes("auth-token")).sort((a, b) => (a.name < b.name ? -1 : 1)).map((c) => c.value).join("");
  return JSON.parse(Buffer.from(decodeURIComponent(token).replace(/^base64-/, ""), "base64url").toString()).user.id as string;
};

const progressOf = (userId: string) => db(`select status, step, reset_at is not null from unit_progress where user_id='${userId}' and unit_id='${UNIT}'`);

// ステップ2を解いて進捗を作り、最後(index 9)まで終えた学習者にする
const completeUnit = async (page: Page, context: BrowserContext) => {
  await page.addInitScript(() => localStorage.setItem("tutorial-state", JSON.stringify({ status: "done", enabled: true })));
  await page.goto(`/units/${UNIT}`);
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "POST");
  await page.getByRole("button", { name: "次へ →" }).click();
  await saved;
  const userId = await userIdOf(context);
  db(`update unit_progress set status='completed', step=9 where user_id='${userId}' and unit_id='${UNIT}'`);
  return userId;
};

// 完了済みとして開いた2つのタブのうち、Aで未完了に戻す
const resetInA = async (context: BrowserContext) => {
  const a = await context.newPage();
  const b = await context.newPage();
  for (const p of [a, b]) {
    await p.goto(`/units/${UNIT}`);
    await expect(p.getByText("この単元は完了しています。")).toBeVisible();
  }
  await a.getByRole("button", { name: "未完了に戻してやり直す" }).click();
  await a.getByRole("dialog").getByRole("button", { name: "未完了に戻す" }).click();
  await expect(a.getByText("この単元は完了しています。")).toBeHidden();
  return { a, b };
};

// 進捗を読み終えるまで待ってから、完了の案内が出ないことを見る
const expectFreshStart = async (page: Page) => {
  const loaded = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "GET");
  await page.reload();
  await loaded;
  await expect(page.getByText("ステップ1 / 10")).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page.getByText("この単元は完了しています。")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "最後のステップを見る" })).toHaveCount(0);
};

test("別のタブで未完了に戻した単元は、古いタブで最後のステップを見ても完了に戻らない", async ({ page, context }) => {
  const userId = await completeUnit(page, context);
  const { a, b } = await resetInA(context);
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);

  await b.getByRole("button", { name: "最後のステップを見る" }).click();
  await expect(b.getByText("ステップ10 / 10")).toBeVisible();
  await expect(b.getByRole("alert").filter({ hasText: STALE })).toBeVisible();
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);

  await expectFreshStart(a);
  // 古いタブも、読み込み直せばDBの進捗から始まる(控えの完了状態に戻らない)
  await expectFreshStart(b);
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);
});

test("最後のステップを開いたままの古いタブで「← 前へ」を押しても、未完了に戻した進捗は完了に戻らない", async ({ page, context }) => {
  const userId = await completeUnit(page, context);
  const b = await context.newPage();
  await b.goto(`/units/${UNIT}`);
  await b.getByRole("button", { name: "最後のステップを見る" }).click();
  await expect(b.getByText("ステップ10 / 10")).toBeVisible();
  await resetInA(context);
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);

  await b.getByRole("button", { name: "← 前へ" }).click();
  await expect(b.getByText("ステップ9 / 10")).toBeVisible();
  await expect(b.getByRole("alert").filter({ hasText: STALE })).toBeVisible();
  await b.getByRole("button", { name: "← 前へ" }).click();
  await expect(b.getByText("ステップ8 / 10")).toBeVisible();
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);
});
