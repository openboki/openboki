import { execFileSync } from "node:child_process";
import { type Page, expect, test } from "@playwright/test";

// 保存値が範囲外・型違いのtweakやpredictを「続きから」で再開しても、保存値を捨てて達成済みの形で戻す(Issue #326)
const sql = (q: string) =>
  execFileSync("docker", ["exec", "-i", "supabase_db_openboki", "psql", "-U", "postgres", "-d", "postgres", "-Atc", q], { encoding: "utf8" }).trim();
const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });

async function postFirst(page: Page, unit: string, debit: string, credit: string, amount: string) {
  await page.goto(unit);
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 8000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  await work(page).getByLabel("借方の科目1").fill(debit);
  await work(page).getByLabel("借方の金額1").fill(amount);
  await work(page).getByLabel("貸方の科目1").fill(credit);
  await work(page).getByLabel("貸方の金額1").fill(amount);
  const saved = page.waitForRequest((r) => r.method() === "POST" && r.url().includes("/rest/v1/unit_progress"));
  await work(page).getByRole("button", { name: "記帳する" }).click();
  const userId: string = (await saved).postDataJSON().user_id;
  await page.getByRole("button", { name: "次へ →" }).click();
  return userId;
}

async function breakAndResume(page: Page, userId: string, exerciseId: string, broken: string) {
  sql(`update public.attempts set answer='${broken}'::jsonb where user_id='${userId}' and exercise_id='${exerciseId}'`);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "続きから" }).click();
}

for (const broken of [`{"useful_life":-3,"cost":1e308,"residual_value":5e307}`, `{"useful_life":0,"cost":1200000,"residual_value":0}`, `{"useful_life":"abc"}`, `{}`]) {
  test(`範囲外の保存値(${broken})のtweakを「続きから」で再開すると、スライダーと計算結果が合う`, async ({ page }) => {
    const userId = await postFirst(page, "/units/depreciation/straight-line", "車両運搬具", "現金", "1200000");
    const life = page.getByRole("slider", { name: /耐用年数/ });
    await life.focus();
    await life.press("ArrowRight");
    await life.press("ArrowRight");
    await expect(page.getByText("できました", { exact: true })).toBeVisible();
    await expect.poll(() => sql(`select count(*) from public.attempts where user_id='${userId}' and exercise_id='depreciation/straight-line#2'`)).toBe("1");

    await breakAndResume(page, userId, "depreciation/straight-line#2", broken);
    await expect(page.getByText("ステップ3 / 9")).toBeVisible();
    await expect(work(page).getByText(/-\d+\s*年/)).toHaveCount(0);
    const years = Number(await life.inputValue());
    expect(years).toBeGreaterThanOrEqual(1);
    expect(years).toBeLessThanOrEqual(12);
    await expect(work(page).getByText(`${years} 年`, { exact: true })).toBeVisible();
    // 償却費は結果の表から読む。取得原価のラベルと混同しない
    const cost = Number(await page.getByRole("slider", { name: /取得原価/ }).inputValue());
    const residual = Number(await page.getByRole("slider", { name: /残存価額/ }).inputValue());
    await expect(work(page).locator("dd").first()).toHaveText(`${Math.floor((cost - residual) / years).toLocaleString("ja-JP")}円`);
    await expect(work(page).getByRole("status").filter({ hasText: "目標:" })).toContainText("達成");
    await expect(page.getByRole("button", { name: "次へ →" })).not.toHaveAttribute("aria-disabled", "true");
  });
}

test("形の違う保存値のpredictを「続きから」で再開すると、模範解答の予想で達成済みとして戻す", async ({ page }) => {
  const userId = await postFirst(page, "/units/bookkeeping-basics/five-elements", "現金", "資本金", "1000000");
  await work(page).getByLabel("資産の予想", { exact: true }).selectOption({ label: "変わらない" });
  await work(page).getByRole("button", { name: "予想して記帳する" }).click();
  await expect.poll(() => sql(`select correct from public.attempts where user_id='${userId}' and exercise_id='bookkeeping-basics/five-elements#2'`)).toBe("t");

  await breakAndResume(page, userId, "bookkeeping-basics/five-elements#2", `{}`);
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await expect(work(page).getByLabel("資産の予想", { exact: true })).toHaveValue("none");
  await expect(page.getByText("もう一歩")).toHaveCount(0);
});
