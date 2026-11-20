import { expect, test } from "@playwright/test";

// Issue #403: 1385〜1386年の単元のバルトロメオに対し、108年後の1494年の店主を「孫」と書いていた
test("1494年の店の主人が、1386年のバルトロメオの孫になっていない", async ({ page }) => {
  await page.goto("/units/birth-of-double-entry/venture-profit-and-double-entry");
  await expect(page.getByRole("region", { name: "ガイド" })).toContainText("1386年");
  await page.goto("/units/birth-of-double-entry/venetian-method-and-pacioli");
  const guide = page.getByRole("region", { name: "ガイド" });
  await expect(guide).toContainText("1494年");
  // 108年で2世代は無理があるので、「孫のバルトロメオ」「祖父」とは書かず、世代をぼかす
  await expect(guide).not.toContainText("孫のバルトロメオ");
  await expect(guide).not.toContainText("祖父");
  // 取引相手のジョヴァンニとニッコロは同名のまま使うので、代替わりした家だと分かる文がある
  await expect(guide).toContainText("当主が代々同じ名を継いでいる");
});
