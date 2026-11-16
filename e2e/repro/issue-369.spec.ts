import { expect, test } from "@playwright/test";

// 高さいっぱいの案内先(ガイド)では、ツアーのカードが案内先そのものに重なっていた
test.use({ viewport: { width: 1280, height: 800 } });

test("ツアー2/12のカードがガイドの見出しを隠さない", async ({ page }) => {
  await page.goto("/units/tutorial/first-entry?tour=1");
  await page.getByRole("dialog", { name: "チュートリアル" }).getByRole("button", { name: "はじめる" }).click();
  const card = page.locator("[data-tour-card]");
  await expect(card).toContainText("ここはガイド");
  const heading = page.getByRole("region", { name: "ガイド" }).getByRole("heading").first();
  const c = (await card.boundingBox())!;
  const h = (await heading.boundingBox())!;
  const overlaps = c.x < h.x + h.width && h.x < c.x + c.width && c.y < h.y + h.height && h.y < c.y + c.height;
  expect(overlaps).toBe(false);
});
