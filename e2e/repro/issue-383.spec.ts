import { expect, test } from "@playwright/test";

// 科目欄に「送料」「運賃」と入れると発送費が候補に出ず、「という科目はありません」で止まっていた
test("科目欄の「送料」「運賃」で発送費が候補に出る", async ({ page }) => {
  await page.goto("/units/merchandise/returns-and-costs");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const field = work.getByLabel("借方の科目1");
  const candidates = page.getByRole("listbox", { name: "科目の候補" });

  await field.fill("送料");
  await expect(candidates).toContainText("発送費");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");

  await field.fill("運賃");
  await expect(candidates).toContainText("発送費");
});
