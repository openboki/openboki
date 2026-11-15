import { expect, test } from "@playwright/test";
import { THEMES } from "../../src/themes";

// 「テーマ」の明るさで、選択中のボタンの枠線がポップオーバーの背景と3:1以上の差を持つ(WCAG 1.4.11)

test("選択中の明るさボタンが、どのテーマ・明るさでも背景と見分けられる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "テーマ", exact: true }).click();
  const themes = page.getByRole("group", { name: "テーマ" });
  const modes = page.getByRole("group", { name: "明るさ" });
  for (const t of THEMES) {
    await themes.getByRole("button", { name: new RegExp(t.name) }).click();
    for (const label of ["ライト", "ダーク"]) {
      await modes.getByRole("button", { name: label }).click();
      await page.mouse.move(0, 400);
      const selected = modes.getByRole("button", { name: label });
      await expect(selected).toHaveAttribute("aria-pressed", "true");
      const ratio = await selected.evaluate((el) => {
        const px = (c: string) => {
          const cv = document.createElement("canvas").getContext("2d")!;
          cv.fillStyle = c;
          cv.fillRect(0, 0, 1, 1);
          return [...cv.getImageData(0, 0, 1, 1).data];
        };
        const L = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        let x: Element = el.parentElement!;
        while (px(getComputedStyle(x).backgroundColor)[3] < 128) x = x.parentElement!;
        const border = px(getComputedStyle(el).borderTopColor);
        // 透明な枠線は印にならない
        if (border[3] < 128) return 1;
        const a = L(border);
        const b = L(px(getComputedStyle(x).backgroundColor));
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(ratio, `${t.name}・${label}`).toBeGreaterThanOrEqual(3);
    }
  }
});
