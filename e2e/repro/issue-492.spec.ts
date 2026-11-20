import { expect, type BrowserContext, type Page, test } from "@playwright/test";
import { db } from "../../scripts/monkey/session.mjs";

const UNIT = "bookkeeping-basics/five-elements";
const TITLE = "「5つの要素と仕訳」を未完了に戻す";

// Issue #492: 完了した単元を解き直す入口が単元の中にしか無く、解き直しても一覧は「完了」のままだった(#481の置き換え)
const postCapital = async (page: Page) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
};

const userIdOf = async (context: BrowserContext) => {
  const token = (await context.cookies()).filter((c) => c.name.includes("auth-token")).sort((a, b) => (a.name < b.name ? -1 : 1)).map((c) => c.value).join("");
  return JSON.parse(Buffer.from(decodeURIComponent(token).replace(/^base64-/, ""), "base64url").toString()).user.id as string;
};

const savedProgress = (page: Page) => page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "POST");

// ステップ2を解いて3へ進む。completeなら最後まで終えた学習者を模す(10ステップの単元の最後はindex 9)
const study = async (page: Page, context: BrowserContext, complete: boolean) => {
  await page.addInitScript(() => localStorage.setItem("tutorial-state", JSON.stringify({ status: "done", enabled: true })));
  await page.goto(`/units/${UNIT}`);
  await page.getByRole("button", { name: "次へ →" }).click();
  await postCapital(page);
  const saved = savedProgress(page);
  await page.getByRole("button", { name: "次へ →" }).click();
  await saved;
  const userId = await userIdOf(context);
  if (complete) db(`update unit_progress set status='completed', step=9 where user_id='${userId}' and unit_id='${UNIT}'`);
  return userId;
};

// 新しいタブで開き直した状態にする
const reopen = async (page: Page) => {
  await page.evaluate(() => sessionStorage.clear());
  await page.goto(`/units/${UNIT}`);
};

const progressOf = (userId: string) => db(`select status, step, reset_at is not null from unit_progress where user_id='${userId}' and unit_id='${UNIT}'`);

test("一覧の「未完了に戻す」で完了が消え、単元は未回答のステップ1から始まる", async ({ page, context }) => {
  const userId = await study(page, context, true);
  // 同じタブの控え(完了時の位置と答え)を残したまま一覧へ移る
  await page.goto("/topics/bookkeeping-basics");
  const main = page.getByRole("main");
  await expect(main.getByText("完了", { exact: true })).toBeVisible();

  await main.getByRole("button", { name: TITLE }).click();
  await page.getByRole("dialog").getByRole("button", { name: "キャンセル" }).click();
  await expect(main.getByText("完了", { exact: true })).toBeVisible();
  expect(progressOf(userId)).toEqual([["completed", "9", "f"]]);

  await main.getByRole("button", { name: TITLE }).click();
  await page.getByRole("dialog").getByRole("button", { name: "未完了に戻す" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(main.getByText("完了", { exact: true })).toHaveCount(0);
  await expect(main.getByRole("button", { name: TITLE })).toHaveCount(0);
  await expect(main.getByRole("link", { name: "5つの要素と仕訳" })).toBeFocused();
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);
  await page.reload();
  await expect(main.getByRole("link", { name: "5つの要素と仕訳" })).toBeVisible();
  await expect(main.getByText("完了", { exact: true })).toHaveCount(0);
  await expect(main.getByText("学習中", { exact: true })).toHaveCount(0);

  // 戻した単元は、同じタブでも完了の案内も前回の答えも出ない
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto(`/units/${UNIT}`);
  await expect(page.getByText("ステップ1 / 10")).toBeVisible();
  await expect(page.getByText("この単元は完了しています。")).toHaveCount(0);
  await next.click();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await postCapital(page);
  const saved = savedProgress(page);
  await next.click();
  await saved;

  // 新しいタブでは今回の位置から続き、ステップ3に前回の答えは入らない
  await reopen(page);
  await expect(page.getByText("前回はステップ3まで進みました。")).toBeVisible();
  await page.getByRole("button", { name: "続きから" }).click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await expect(next).toHaveAttribute("aria-disabled", "true");
  expect(progressOf(userId)).toEqual([["started", "2", "t"]]);
  expect(db(`select count(*) from attempts where user_id='${userId}' and exercise_id='${UNIT}#1' and correct`)).toEqual([["2"]]);
  await page.goto("/topics/bookkeeping-basics");
  await expect(main.getByText("学習中", { exact: true })).toBeVisible();
});

test("完了の案内の「未完了に戻してやり直す」で、その場でステップ1から解き直せる", async ({ page, context }) => {
  const userId = await study(page, context, true);
  await reopen(page);
  await expect(page.getByText("この単元は完了しています。")).toBeVisible();
  // 先を見てからステップ1へ戻っても、戻す前の到達位置を進捗に書き戻さない
  await page.getByRole("button", { name: "次へ →" }).click();
  await page.getByRole("button", { name: "← 前へ" }).click();
  await page.getByRole("button", { name: "未完了に戻してやり直す" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "未完了に戻す" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("この単元は完了しています。")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeFocused();
  expect(progressOf(userId)).toEqual([["started", "0", "t"]]);

  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
  await expect(next).toHaveAttribute("aria-disabled", "true");

  // 同じタブのreloadでも完了時の答えに戻らない
  await page.reload();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await page.goto("/topics/bookkeeping-basics");
  await expect(page.getByRole("main").getByText("学習中", { exact: true })).toBeVisible();

  // 最後まで解き直したときの書き込みは、後退防止のトリガーを通ってまた完了になる
  db(`update unit_progress set status='completed', step=9 where user_id='${userId}' and unit_id='${UNIT}'`);
  await page.reload();
  await expect(page.getByRole("main").getByText("完了", { exact: true })).toBeVisible();
});

test("途中まで進めただけの単元には、戻す操作を出さない", async ({ page, context }) => {
  await study(page, context, false);
  await reopen(page);
  await expect(page.getByRole("button", { name: "続きから" })).toBeVisible();
  await expect(page.getByRole("button", { name: "未完了に戻してやり直す" })).toHaveCount(0);
  await page.goto("/topics/bookkeeping-basics");
  await expect(page.getByRole("main").getByText("学習中", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: TITLE })).toHaveCount(0);
});
