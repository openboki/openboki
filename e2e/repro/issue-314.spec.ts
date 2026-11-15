import { expect, type Page, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

// スポットライトのcomputed boxShadowから、枠(--primary)の有無と暗幕の不透明度を読む
async function readSpotlight(page: Page) {
  return page.evaluate(() => {
    const ring = document.querySelector<HTMLElement>("div.ring-primary")!;
    const shadow = getComputedStyle(ring).boxShadow;
    const probe = document.createElement("div");
    probe.style.color = "var(--primary)";
    document.body.append(probe);
    const primary = getComputedStyle(probe).color;
    probe.remove();
    const colors: string[] = shadow.match(/rgba?\([^)]+\)/g) ?? [];
    const dim = colors.at(-1)!.match(/[\d.]+/g)!.map(Number);
    return { hasFrame: colors.includes(primary), dimAlpha: dim[3] ?? 1 };
  });
}

async function openTourStep3(page: Page) {
  await page.goto("/units/tutorial/first-entry?tour=1");
  const tour = page.getByRole("dialog", { name: "チュートリアル" });
  await tour.getByRole("button", { name: "はじめる" }).click();
  await tour.getByRole("button", { name: "次へ" }).click();
  await expect(tour).toContainText("次へ進む");
}

async function showPlace(page: Page) {
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "使い方", exact: true }).click();
  const help = page.getByRole("dialog", { name: "会計IDEの使い方" });
  await help.getByText("ガイド(読む)").click();
  await help.getByRole("button", { name: /場所を示す/ }).first().click();
  await expect(help).toBeHidden();
  await expect(page.locator("[data-spotlight]")).toBeAttached();
}

for (const mode of ["light", "dark"] as const) {
  for (const [name, open] of [
    ["ツアー", openTourStep3],
    ["「場所を示す」", showPlace],
  ] as const) {
    test(`${mode}: ${name}のスポットライトは枠を描き、ダークでは暗幕を濃くする`, async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem("mode", m), mode);
      await open(page);
      const { hasFrame, dimAlpha } = await readSpotlight(page);
      expect(hasFrame).toBe(true);
      if (mode === "dark") expect(dimAlpha).toBeGreaterThan(0.45);
      else expect(dimAlpha).toBeCloseTo(0.45);
    });
  }
}
