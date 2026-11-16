import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const THEMES = ["town-shop", "ai-shu", "ledger-paper", "workbench"];
const ELEMENT_LABELS: Record<string, string> = { asset: "資産", liability: "負債", equity: "純資産", revenue: "収益", expense: "費用" };
type Line = { account: string; amount: number };
const units = JSON.parse(readFileSync(".velite/units.json", "utf8"));
const accounts: { id: string; name: string; element: string }[] = JSON.parse(readFileSync(".velite/accounts.json", "utf8")).accounts;
const nameOf = (id: string) => accounts.find((a) => a.id === id)!.name;

// 単元を正解で最後のステップまで進める
async function solveAll(page: Page, unitId: string) {
  const unit = units.find((u: { id: string }) => u.id === unitId);
  const work = page.getByRole("region", { name: "ワークスペース" });
  for (let i = 0; i < unit.steps.length - 1; i++) {
    const t = unit.steps[i].task;
    if (t.type === "post") {
      for (const [side, lines] of [["借方", t.answer.debit], ["貸方", t.answer.credit]] as [string, Line[]][]) {
        await work.getByLabel(`${side}の科目1`).fill(nameOf(lines[0].account));
        await work.getByLabel(`${side}の金額1`).fill(String(lines[0].amount));
      }
      await work.getByRole("button", { name: "記帳する" }).click();
    } else if (t.type === "predict") {
      for (const [el, v] of Object.entries(t.answer).filter(([el]) => !t.elements || t.elements.includes(el))) await work.getByLabel(`${ELEMENT_LABELS[el]}の予想`, { exact: true }).selectOption(v as string);
      await work.getByRole("button", { name: "予想して記帳する" }).click();
    } else if (t.type === "calc") {
      await work.getByPlaceholder(/^金額\(/).fill(String(t.answer));
      await work.getByRole("button", { name: "確認する" }).click();
    } else if (t.type === "classify") {
      const board = work.getByRole("group", { name: "仕分けボード" });
      for (const id of t.accounts) {
        await board.getByRole("button", { name: nameOf(id), exact: true }).click();
        await board.getByRole("button", { name: `${ELEMENT_LABELS[accounts.find((a) => a.id === id)!.element]} ← ここに入れる`, exact: true }).click();
      }
      await work.getByRole("button", { name: "確認する" }).click();
    }
    if (t.type !== "observe") await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "次へ →" }).click();
    await expect(page.getByText(`ステップ${i + 2} / ${unit.steps.length}`)).toBeVisible();
  }
}

// Issue #357: ふりかえりの比例図(figure proportion)が帯の上に11pxの白文字を載せていて、全テーマで4.5:1に届かなかった
test("比例図の帯の科目名と金額は全テーマ・ライト / ダークで4.5:1以上", async ({ page }) => {
  await page.goto("/units/bookkeeping-basics/five-elements");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  await solveAll(page, "bookkeeping-basics/five-elements");
  const guide = page.getByRole("region", { name: "ガイド" });
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    for (const theme of THEMES) {
      await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
      }, theme);
      for (const label of ["現金", "借入金", "資本金"]) {
        const ratio = await guide.locator(`[title^="${label} "] span`).first().evaluate((el) => {
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
