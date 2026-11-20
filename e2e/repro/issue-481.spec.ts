import { expect, type BrowserContext, type Page, test } from "@playwright/test";
import { db } from "../../scripts/monkey/session.mjs";

const UNIT = "bookkeeping-basics/five-elements";

// Issue #481: 完了した単元を開き直すと全ステップが解いた状態で開き、解き直す入口が無かった
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

// ステップ2を解いて3へ進み、新しいタブで開き直した状態にする。completeなら最後まで終えた学習者を模す(10ステップの単元の最後はindex 9)
const reopen = async (page: Page, context: BrowserContext, complete: boolean) => {
  await page.addInitScript(() => localStorage.setItem("tutorial-state", JSON.stringify({ status: "done", enabled: true })));
  await page.goto(`/units/${UNIT}`);
  await page.getByRole("button", { name: "次へ →" }).click();
  await postCapital(page);
  const saved = page.waitForResponse((r) => r.url().includes("/rest/v1/unit_progress") && r.request().method() === "POST");
  await page.getByRole("button", { name: "次へ →" }).click();
  await saved;
  const userId = await userIdOf(context);
  if (complete) db(`update unit_progress set status='completed', step=9 where user_id='${userId}' and unit_id='${UNIT}'`);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  return userId;
};

test("完了の案内の「最初からやり直す」で、未回答のステップ1から解き直せる", async ({ page, context }) => {
  const userId = await reopen(page, context, true);
  const next = page.getByRole("button", { name: "次へ →" });
  await expect(page.getByText("この単元は完了しています。")).toBeVisible();
  await page.getByRole("button", { name: "最初からやり直す" }).click();
  await expect(page.getByText("この単元は完了しています。")).toHaveCount(0);
  await expect(page.getByText("ステップ1 / 10")).toBeVisible();

  await next.click();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await postCapital(page);
  await next.click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await expect(next).toHaveAttribute("aria-disabled", "true");

  // 同じタブのreloadでは、完了時の答えではなく解き直しの位置に戻る
  await page.reload();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("この単元は完了しています。")).toHaveCount(0);

  // 完了は変わらず、解き直しの回答は追記される
  await expect.poll(() => db(`select status, step from unit_progress where user_id='${userId}' and unit_id='${UNIT}'`)).toEqual([["completed", "9"]]);
  await expect.poll(() => db(`select count(*) from attempts where user_id='${userId}' and exercise_id='${UNIT}#1' and correct`)).toEqual([["2"]]);
  await page.goto("/topics/bookkeeping-basics");
  await expect(page.getByRole("main").getByText("完了", { exact: true })).toBeVisible();
});

test("最後のステップの「最初からやり直す」でも解き直せる", async ({ page, context }) => {
  await reopen(page, context, true);
  await page.getByRole("button", { name: "最後のステップを見る" }).click();
  await expect(page.getByText("ステップ10 / 10")).toBeVisible();
  await page.getByRole("button", { name: "最初からやり直す" }).click();
  await expect(page.getByText("ステップ1 / 10")).toBeVisible();
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await expect(page.getByText("ステップ2 / 10")).toBeVisible();
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
  await expect(next).toHaveAttribute("aria-disabled", "true");
});

test("途中まで進めただけの単元には「最初からやり直す」を出さない", async ({ page, context }) => {
  await reopen(page, context, false);
  await expect(page.getByRole("button", { name: "続きから" })).toBeVisible();
  await expect(page.getByRole("button", { name: "最初からやり直す" })).toHaveCount(0);
});
