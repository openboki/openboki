import { expect, test } from "@playwright/test";

// Issue #336: 単元限定の科目の「もっと見る」が「用語集には載っていません」の1文だけで、説明文が言う人名勘定・口別計算へ進めなかった

test("単元限定の科目の「もっと見る」から説明文の概念へ進める", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  await page.getByRole("button", { name: "今はしない" }).click().catch(() => {});
  const result = page.getByRole("region", { name: "結果" });

  await result.getByRole("button", { name: "胡椒(アレクサンドリア航海)", exact: true }).first().click();
  const pepper = page.getByRole("dialog", { name: "胡椒(アレクサンドリア航海)" });
  await pepper.getByRole("button", { name: "もっと見る" }).click();
  await expect(pepper.getByRole("link", { name: /口別計算/ })).toHaveAttribute("href", "/glossary#venture_accounting");
  await page.keyboard.press("Escape");

  await result.getByRole("button", { name: "元手", exact: true }).first().click();
  const capital = page.getByRole("dialog", { name: "元手" });
  await capital.getByRole("button", { name: "もっと見る" }).click();
  await expect(capital.getByRole("link", { name: /純資産/ })).toHaveAttribute("href", "/glossary#equity");
});
