import { expect, test } from "@playwright/test";

// 科目欄に未収入金の略称「未収金」と入れると候補が0件になり、「という科目はありません」で止まっていた
test("科目欄の「未収金」で未収入金が候補に出る", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/other-receivables-and-payables");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const field = work.getByLabel("借方の科目1");
  const candidates = page.getByRole("listbox", { name: "科目の候補" });

  await field.fill("未収金");
  await expect(candidates).toContainText("未収入金");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");

  // 欄を離れても「科目はありません」にならず、未収入金に確定する
  await work.getByLabel("借方の金額1").focus();
  await expect(field).toHaveValue("未収入金");
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
});
