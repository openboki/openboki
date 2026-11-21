// READMEの冒頭に置くGIF(仕訳を記帳すると貸借対照表が動く様子)を撮り、docs/images/ide-demo.gifに置く。
// 使い方: ローカルSupabaseと開発サーバーを起動してから`make readme-demo`(ffmpegが要る)。別のポートは`README_DEMO_URL`で渡す
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const url = process.env.README_DEMO_URL ?? "http://localhost:3000/units/bookkeeping-basics/five-elements";
const out = "docs/images/ide-demo.gif";
const size = { width: 1200, height: 800 };
const dir = mkdtempSync(join(tmpdir(), "readme-demo-"));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: size, recordVideo: { dir, size } });
const started = Date.now();
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
// 開発サーバーの印(Next.jsのDev Tools)は製品の画面ではないので隠す
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.getByRole("button", { name: "今はしない" }).click();
await page.getByRole("button", { name: "次へ" }).click();
const work = page.getByRole("region", { name: "ワークスペース" });
await work.getByLabel("借方の科目1").waitFor();
await page.waitForTimeout(500);

// ここからがGIFになる。読み込みとチュートリアルの案内は切り落とす
const from = (Date.now() - started) / 1000;
await page.waitForTimeout(1200);
for (const [label, value] of [
  ["借方の科目1", "現金"],
  ["借方の金額1", "1000000"],
  ["貸方の科目1", "資本金"],
  ["貸方の金額1", "1000000"],
]) {
  await work.getByLabel(label).click();
  await work.getByLabel(label).pressSequentially(value, { delay: 90 });
  await page.waitForTimeout(450);
}
await page.waitForTimeout(600);
await work.getByRole("button", { name: "記帳する" }).click();
await page.waitForTimeout(3500);
const duration = (Date.now() - started) / 1000 - from;

const video = await page.video().path();
await context.close();
await browser.close();

mkdirSync("docs/images", { recursive: true });
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error", "-ss", String(from), "-t", String(duration), "-i", video,
  "-vf", "fps=8,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
  out,
]);
rmSync(dir, { recursive: true });
console.log(out);
