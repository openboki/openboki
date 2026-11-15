import { expect, test } from "@playwright/test";

// Issue #275: 「航海の儲けと複式の発見」の本文が画面に無い人名勘定を指し、
// 学習者が記帳する売りが買い付けより前に仕訳帳へ並び、ふりかえりの単元名が実在の題と違っていた

const UNIT = "/units/birth-of-double-entry/venture-profit-and-double-entry";

test("ステップ1の本文が指す人名勘定が結果ペインにある", async ({ page }) => {
  await page.goto(UNIT);
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await expect(page.getByRole("region", { name: "ガイド" })).toContainText("ジョヴァンニとマッテオがいくら負っているか");
  const ledger = page.getByRole("region", { name: "結果" }).getByRole("region", { name: "元帳" });
  await expect(ledger.getByText("ジョヴァンニ").first()).toBeVisible();
  await expect(ledger.getByText("マッテオ").first()).toBeVisible();
});

// ステップ2〜4を解いてステップ5に着く。ステップ3と5は見るだけのステップで、仕訳は入った時点で記帳される
async function reachStep5(page: import("@playwright/test").Page) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  await page.goto(UNIT);
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByRole("textbox").first().fill("30");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  await fill(page, "ジョヴァンニ", "60", "胡椒(アレクサンドリア航海)", "60");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ5 / 9")).toBeVisible();
}

async function fill(page: import("@playwright/test").Page, d: string, da: string, c: string, ca: string) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(d);
  await work.getByLabel("借方の金額1").fill(da);
  await work.getByLabel("貸方の科目1").fill(c);
  await work.getByLabel("貸方の金額1").fill(ca);
}

test("仕訳帳で胡椒の買い付けが学習者の記帳した売りより前に並ぶ", async ({ page }) => {
  await reachStep5(page);
  // 仕訳帳(記帳済み)はワークスペースのタブにある
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByRole("tab", { name: "仕訳帳(記帳済み)" }).click();
  const list = work.getByRole("list").filter({ hasText: "胡椒50袋を120ドゥカートで買った" });
  await expect(list).toBeVisible();
  const journal = (await list.textContent()) ?? "";
  const bought = journal.indexOf("胡椒50袋を120ドゥカートで買った");
  const sold = journal.indexOf("ジョヴァンニに胡椒20袋を60ドゥカートで売った");
  expect(bought).toBeGreaterThanOrEqual(0);
  expect(sold).toBeGreaterThan(bought);
});

test("ふりかえりの単元名が実在の題で、その単元を開ける", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" }).first();
  await reachStep5(page);
  await next.click();
  await expect(page.getByText("ステップ6 / 9")).toBeVisible();
  await work.getByRole("radio").nth(2).check();
  await fill(page, "ジョヴァンニ", "50", "ワイン(クレタ航海)", "50");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await expect(page.getByText("ステップ7 / 9")).toBeVisible();
  await fill(page, "胡椒(アレクサンドリア航海)", "30", "元手", "30");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ9 / 9")).toBeVisible();
  const guide = page.getByRole("region", { name: "ガイド" });
  const link = guide.getByRole("link", { name: "売れ残りと売上原価" });
  await expect(link).toHaveAttribute("href", "/units/merchandise/cost-of-goods-sold");
});
