import { expect, test } from "@playwright/test";

// 人名勘定で売りを右に置く・左右の合計を足す誤答に誤解の説明が付く(Issue #554)
test("覚え書きと人名勘定の売りを右・左右を足す誤答に誤解の説明が付く", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/memorandum-and-personal-accounts");
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  await next.click();
  await work.getByPlaceholder(/金額/).fill("70");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  await next.click();
  const board = page.getByRole("group", { name: "仕分けボード" });
  const place = async (label: string, box: string) => {
    await board.getByRole("button", { name: new RegExp("^" + label) }).first().click();
    await board.getByRole("button", { name: new RegExp("^" + box) }).first().click();
  };
  for (const [l, b] of [["3月9日", "右"], ["3月14日", "右"], ["3月18日", "右"], ["3月20日", "右"], ["3月22日", "左"]]) await place(l, b);
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("人名勘定の左右をお金や物の向きで決める");
  await place("3月9日", "左");
  await place("3月20日", "左");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(done).toBeVisible();
  await next.click();
  await work.getByPlaceholder(/金額/).fill("180");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("残高を左右の合計の和と思う");
});
