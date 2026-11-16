import { expect, test } from "@playwright/test";

// 評価勘定のバッジの「(控除)」が、全テーマ × 明るさで背景に対して4.5:1以上ある(10pxの小さい文字)

const themes = ["town-shop", "ai-shu", "ledger-paper", "workbench"];
const modes = ["light", "dark"];

test("要素バッジの「(控除)」が読める", async ({ page }) => {
  for (const theme of themes) {
    for (const mode of modes) {
      await page.goto("/glossary");
      await page.evaluate(
        ([t, m]) => {
          localStorage.setItem("theme", t);
          localStorage.setItem("mode", m);
        },
        [theme, mode],
      );
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const contra = page.getByText("(控除)", { exact: true }).first();
      await contra.waitFor();
      // 祖先の背景を外側から順にcanvasへ重ね、文字色を不透明度込みで重ねた色と比べる
      const ratio = await contra.evaluate((el) => {
        const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
        const chain: Element[] = [];
        for (let n: Element | null = el.parentElement; n; n = n.parentElement) chain.unshift(n);
        cv.fillStyle = "#fff";
        cv.fillRect(0, 0, 1, 1);
        for (const n of chain) {
          cv.globalAlpha = 1;
          cv.fillStyle = getComputedStyle(n).backgroundColor;
          cv.fillRect(0, 0, 1, 1);
        }
        const bg = [...cv.getImageData(0, 0, 1, 1).data];
        let alpha = 1;
        for (let n: Element | null = el; n; n = n.parentElement) alpha *= Number(getComputedStyle(n).opacity);
        cv.globalAlpha = alpha;
        cv.fillStyle = getComputedStyle(el).color;
        cv.fillRect(0, 0, 1, 1);
        const fg = [...cv.getImageData(0, 0, 1, 1).data];
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      });
      expect(ratio, `${theme} ${mode}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
