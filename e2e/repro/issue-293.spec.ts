import { expect, test } from "@playwright/test";

// Issue #293: 科目に無い語を漢字で入れても「漢字の一部を入れて」と出て、その科目が無いことが伝わらなかった
async function fillDebitAccount(page: import("@playwright/test").Page, name: string) {
  await page.goto("/units/cash-and-deposits/checking-account");
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill(name);
  await work.getByLabel("借方の金額1").click();
  return work;
}

for (const name of ["小切手", "所得税"]) {
  test(`科目欄に「${name}」と入れると、その名前の科目が無いことを案内する`, async ({ page }) => {
    const work = await fillDebitAccount(page, name);
    await expect(work.getByText("候補から選ぶか、漢字の一部を入れてください")).toHaveCount(0);
    await expect(work.getByText(`「${name}」という科目はありません。候補から選んでください`)).toBeVisible();
  });
}

test("ローマ字で入れたときは、今までどおり漢字の一部を入れるよう案内する", async ({ page }) => {
  const work = await fillDebitAccount(page, "kogitte");
  await expect(work.getByText("候補から選ぶか、漢字の一部を入れてください")).toBeVisible();
  await expect(work.getByText(/という科目はありません/)).toHaveCount(0);
});
