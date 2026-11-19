// イラスト一覧(/illustrations)を全テーマのライト・ダークで撮り、logs/illustrations/に置く。
// 新しい絵が既存の絵とそろっているかを目で確かめるための見本(docs/visual-guidelines.md 6章)。
// 使い方: 開発サーバーを起動してから`make illustrations`。別のポートは`ILLUSTRATIONS_URL`で渡す
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const url = process.env.ILLUSTRATIONS_URL ?? "http://localhost:3000/illustrations";
const themes = ["town-shop", "ai-shu", "ledger-paper", "workbench"];
const out = "logs/illustrations";

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 820, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
for (const theme of themes) {
  for (const mode of ["light", "dark"]) {
    await page.evaluate(
      ([t, m]) => {
        document.documentElement.dataset.theme = t;
        document.documentElement.dataset.mode = m;
      },
      [theme, mode],
    );
    const file = `${out}/${theme}-${mode}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
}
await browser.close();
