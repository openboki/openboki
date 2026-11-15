import { expect, test } from "@playwright/test";

const THEMES = ["town-shop", "ai-shu", "ledger-paper", "workbench"];

// Issue #315: 「会社のかたち」の帯の上に10pxの白文字を載せていて、全テーマで4.5:1に届かなかった
test("「会社のかたち」の帯のラベルは全テーマ・ライト / ダークで4.5:1以上", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  await page.getByRole("button", { name: "次へ →" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1000000");
  await work.getByLabel("貸方の科目1").fill("資本金");
  await work.getByLabel("貸方の金額1").fill("1000000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByRole("status").filter({ hasText: "できました" })).toBeVisible();
  const band = page.getByRole("region", { name: "結果" }).getByRole("region", { name: "会社のかたち" });
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);
      for (const label of ["資産", "負債", "純資産"]) {
        const ratio = await band.getByText(label, { exact: true }).first().evaluate((el) => {
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
          while (px(getComputedStyle(x).backgroundColor)[3] < 128) x = x.parentElement!;
          const a = lum(px(getComputedStyle(el).color));
          const b = lum(px(getComputedStyle(x).backgroundColor));
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        });
        expect(ratio, `${scheme} ${theme} ${label}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});
