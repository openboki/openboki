import { expect, test, type Page } from "@playwright/test";

// Issue #335: 途中経過の予想・仕分けに選択肢に無い値があると、未選択なのに押せたり、科目がボードから消えたりしていた
const unit = "bookkeeping-basics/five-elements";
const key = `ide-session:${unit}`;

async function post(page: Page, debit: string, credit: string, amount: number) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(debit);
  await work.getByLabel("借方の金額1").fill(String(amount));
  await work.getByLabel("貸方の科目1").fill(credit);
  await work.getByLabel("貸方の金額1").fill(String(amount));
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" }).first()).toBeVisible();
  await page.getByRole("button", { name: "次へ →" }).click();
}

async function tamper(page: Page, patch: Record<string, unknown>) {
  await page.evaluate(
    ([k, p]) => {
      const s = JSON.parse(sessionStorage.getItem(k as string)!);
      sessionStorage.setItem(k as string, JSON.stringify({ ...s, ...(p as object) }));
    },
    [key, patch] as const,
  );
  await page.reload();
}

test("途中経過の予想と仕分けに選択肢に無い値があっても、未選択・未配置として戻す", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await page.goto(`/units/${unit}`);
  await page.getByRole("button", { name: "今はしない" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await post(page, "現金", "資本金", 1000000);

  await expect(work.getByLabel("資産の予想")).toBeVisible();
  await tamper(page, { effect: { asset: "bogus" } });
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  await expect(work.getByRole("button", { name: "予想して記帳する" })).toBeDisabled();

  await work.getByLabel("資産の予想").selectOption("none");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await page.getByRole("button", { name: "次へ →" }).click();
  await post(page, "現金", "借入金", 300000);
  await post(page, "現金", "売上", 80000);
  await post(page, "支払家賃", "現金", 50000);

  const board = work.getByRole("group", { name: "仕分けボード" });
  await expect(board).toBeVisible();
  await tamper(page, { placed: { cash: "bogus", sales: "toString" } });
  await expect(page.getByText("ステップ7 / 10")).toBeVisible();
  await expect(board.getByRole("button", { name: /^現金/ })).toBeVisible();
  await expect(board.getByRole("button", { name: /^売上/ })).toBeVisible();
});
