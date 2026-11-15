import { expect, test } from "@playwright/test";

const THEMES = ["town-shop", "ai-shu", "ledger-paper", "workbench"];

// 非選択のタブの文字が、ライトの全テーマで4.5:1に届かなかった(text-foreground/60)
test("ワークスペースの非選択タブの文字は全テーマ・ライト / ダークで4.5:1以上", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const tab = page.getByRole("region", { name: "ワークスペース" }).getByRole("tab", { name: "総勘定元帳(T勘定)" });
  await expect(tab).toHaveAttribute("aria-selected", "false");
  for (const mode of ["light", "dark"]) {
    for (const theme of THEMES) {
      await page.evaluate(([t, m]) => {
        document.documentElement.dataset.theme = t;
        document.documentElement.dataset.mode = m;
      }, [theme, mode]);
      // transition-allで色が遷移し終わるまで待ってから測る
      await page.waitForTimeout(300);
      const ratio = await tab.evaluate((el) => {
        const px = (c: string) => {
          const cv = document.createElement("canvas").getContext("2d")!;
          cv.fillStyle = c;
          cv.fillRect(0, 0, 1, 1);
          return [...cv.getImageData(0, 0, 1, 1).data];
        };
        const lum = ([r, g, b]: number[]) => {
          const f = (v: number) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        let x: Element = el;
        while (px(getComputedStyle(x).backgroundColor)[3] < 255) x = x.parentElement!;
        const bg = px(getComputedStyle(x).backgroundColor);
        const fg = px(getComputedStyle(el).color);
        const a = fg[3] / 255;
        const mixed = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
        const l1 = lum(mixed);
        const l2 = lum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      });
      expect(ratio, `${theme} ${mode}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
