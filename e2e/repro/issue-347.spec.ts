import { expect, test, type Locator, type Page } from "@playwright/test";

// 範囲入力(条件を変える / 帳簿をさかのぼる)はテーマの主色で描く

const work = (page: Page) => page.getByRole("region", { name: "ワークスペース" });
const next = (page: Page) => page.getByRole("button", { name: "次へ →" }).click();

async function post(page: Page, debit: string, credit: string, amount: number) {
  const w = work(page);
  await w.getByLabel("借方の科目1").fill(debit);
  await w.getByLabel("借方の金額1").fill(String(amount));
  await w.getByLabel("貸方の科目1").fill(credit);
  await w.getByLabel("貸方の金額1").fill(String(amount));
  await w.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").getByText("できました", { exact: true })).toBeVisible();
}

// accent-colorと--primaryをどちらもrgbに解決して比べる
async function expectPrimaryAccent(range: Locator) {
  const { accent, primary } = await range.evaluate((e) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--primary)";
    e.parentElement!.appendChild(probe);
    const primary = getComputedStyle(probe).color;
    probe.remove();
    return { accent: getComputedStyle(e).accentColor, primary };
  });
  expect(accent).not.toBe("auto");
  expect(accent).toBe(primary);
}

for (const [theme, mode] of [["ai-shu", "light"], ["workbench", "dark"]] as const) {
  test.describe(`${theme} ${mode}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(([t, m]) => {
        localStorage.setItem("theme", t);
        localStorage.setItem("mode", m);
      }, [theme, mode]);
    });

    test("「条件を変える」のスライダーがテーマの主色で描かれる", async ({ page }) => {
      await page.goto("/units/depreciation/straight-line");
      await page.getByRole("button", { name: "今はしない" }).click();
      await next(page);
      await post(page, "車両運搬具", "現金", 1200000);
      await next(page);
      const range = page.locator("input[type=range]").first();
      await expect(range).toBeVisible();
      await expectPrimaryAccent(range);
    });

    test("「帳簿をさかのぼる」のスライダーがテーマの主色で描かれる", async ({ page }) => {
      await page.goto("/units/bookkeeping-basics/five-elements");
      await page.getByRole("button", { name: "今はしない" }).click();
      await next(page);
      await post(page, "現金", "資本金", 1000000);
      await next(page);
      await work(page).getByLabel("資産の予想", { exact: true }).selectOption({ label: "変わらない" });
      await work(page).getByRole("button", { name: "予想して記帳する" }).click();
      const slider = page.getByRole("region", { name: "結果" }).getByRole("slider", { name: "帳簿をさかのぼる" });
      await expect(slider).toBeVisible();
      await expectPrimaryAccent(slider);
    });
  });
}
