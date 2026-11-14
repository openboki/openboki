import { expect, test, type Page } from "@playwright/test";

// sessionStorageのide-sessionに読めない値があっても、捨ててステップ1で開く(Issue #277)

const UNIT = "/units/bookkeeping-basics/five-elements";
const KEY = "ide-session:bookkeeping-basics/five-elements";

async function patchSession(page: Page, key: string, patch: object) {
  await expect.poll(() => page.evaluate((k) => sessionStorage.getItem(k), key)).not.toBeNull();
  await page.evaluate(
    ([k, p]) => sessionStorage.setItem(k, JSON.stringify({ ...JSON.parse(sessionStorage.getItem(k)!), ...p })),
    [key, patch] as const,
  );
  await page.reload();
  // サーバー描画のステップ1が先に見えるので、マウント後の復元が走り終わるのを待つ
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

for (const [name, patch] of [
  ["stepIndexが負", { stepIndex: -1 }],
  ["stepIndexが小数", { stepIndex: 1.5 }],
  ["postedにnull", { posted: [null] }],
  ["answeredにnull", { answered: [null] }],
  ["stepAttemptsにnull", { stepAttempts: [null] }],
] as const) {
  test(`sessionStorageのide-sessionが不正(${name})でも単元が開ける`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(UNIT);
    await expect(page.getByText(/ステップ1 \/ \d+/)).toBeVisible();
    await patchSession(page, KEY, patch);
    await expect(page.getByText(/couldn.t load/)).toHaveCount(0);
    await expect(page.getByText(/ステップ1 \/ \d+/)).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("ide-sessionに未知の科目があっても貸借対照表が崩れない", async ({ page }) => {
  const entry = { debit: [{ account: "deleted_account", amount: 30000 }], credit: [{ account: "checking_account", amount: 30000 }] };
  await page.goto("/units/cash-and-deposits/petty-cash");
  await expect(page.getByText(/ステップ1 \/ 9/)).toBeVisible();
  await patchSession(page, "ide-session:cash-and-deposits/petty-cash", { stepIndex: 2, reached: 2, posted: [{ step: 1, memo: "x", entry }], answered: [[1, entry]] });
  await expect(page.getByText(/ステップ1 \/ 9/)).toBeVisible();
  await expect(page.getByRole("region", { name: "結果" })).not.toContainText("一致していません");
});
