import { expect, test } from "@playwright/test";

// Issue #331: 歴史の単元で、時代に無い現代の科目が候補に出て記帳できていた
test("歴史の単元では現代の買掛金が候補に出ず、名前で打っても科目として決まらない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ3 / 10")).toBeVisible();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("買掛");
  await expect(page.getByRole("listbox", { name: "科目の候補" }).getByRole("option", { name: /買掛金/ })).toHaveCount(0);
  await work.getByLabel("借方の科目1").fill("絹");
  await expect(page.getByRole("listbox", { name: "科目の候補" }).getByRole("option", { name: /絹/ })).toHaveCount(1);

  await work.getByLabel("借方の科目1").fill("仕入");
  await work.getByLabel("借方の金額1").fill("100");
  await work.getByLabel("貸方の科目1").fill("買掛金");
  await work.getByLabel("貸方の金額1").fill("100");
  await expect(work.getByLabel("借方の科目1")).toHaveAttribute("aria-invalid", "true");
  await expect(work.getByLabel("貸方の科目1")).toHaveAttribute("aria-invalid", "true");
});
