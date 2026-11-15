import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

// 保存済みの回答が仕訳の形でないpostステップを再開しても、例外を出さず模範解答で達成済みとして戻す(Issue #308)。
// 内容の改訂でステップの種類が入れ替わり、predictの回答がpostのステップに当たった場合と同じ形
const unit = "/units/bookkeeping-basics/five-elements";
const sql = (q: string) =>
  execFileSync("docker", ["exec", "-i", "supabase_db_openboki", "psql", "-U", "postgres", "-d", "postgres", "-Atc", q], { encoding: "utf8" }).trim();

for (const broken of [`{"asset":"none"}`, `[]`, `{"debit":"x","credit":null}`]) {
  test(`仕訳でない保存値(${broken})のpostステップを「続きから」で再開しても落ちない`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(unit);
    await page.getByRole("button", { name: "今はしない" }).click({ timeout: 8000 }).catch(() => {});
    await page.getByRole("button", { name: "次へ →" }).click();
    const work = page.getByRole("region", { name: "ワークスペース" });
    await work.getByLabel("借方の科目1").fill("現金");
    await work.getByLabel("借方の金額1").fill("1000000");
    await work.getByLabel("貸方の科目1").fill("資本金");
    await work.getByLabel("貸方の金額1").fill("1000000");
    const saved = page.waitForRequest((r) => r.method() === "POST" && r.url().includes("/rest/v1/unit_progress"));
    await work.getByRole("button", { name: "記帳する" }).click();
    const userId: string = (await saved).postDataJSON().user_id;
    await expect.poll(() => sql(`select count(*) from public.attempts where user_id='${userId}'`)).toBe("1");

    sql(`update public.attempts set answer='${broken}'::jsonb where user_id='${userId}'`);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: "続きから" }).click();
    await expect(page.getByText("ステップ2 / 10")).toBeVisible();
    await expect(page.getByRole("button", { name: "次へ →" })).not.toHaveAttribute("aria-disabled", "true");
    await expect(work.getByLabel("借方の科目1")).toHaveValue("現金");
    await expect(work.getByLabel("借方の金額1")).toHaveValue(/1,?000,?000/);
    await expect(work.getByLabel("貸方の科目1")).toHaveValue("資本金");
    expect(errors).toEqual([]);
  });
}
