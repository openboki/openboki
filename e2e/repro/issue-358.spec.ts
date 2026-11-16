import { expect, test } from "@playwright/test";
import fs from "node:fs";

const THEMES = ["town-shop", "ai-shu", "ledger-paper", "workbench"];
const CHIPS = ["貸付金", "借入金", "受取利息", "支払利息"];

// 1280幅の仕分けボードで、箱に入れた科目のチップが科目名の途中で2行に折れていた
test("箱に入れた科目名は1行で読める(1280幅、全テーマ)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/units/receivables-and-payables/loans");
  const banner = page.getByRole("button", { name: "今はしない" });
  if (await banner.isVisible()) await banner.click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = async () => page.getByRole("button", { name: "次へ →" }).click();
  const post = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
    await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
  };
  await next();
  await post("貸付金", "普通預金", "100000");
  await next();
  for (const [el, v] of [["資産", "increase"], ["負債", "none"], ["純資産", "increase"], ["収益", "increase"], ["費用", "none"]]) await work.getByLabel(`${el}の予想`, { exact: true }).selectOption(v);
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
  await next();
  await post("支払利息", "普通預金", "3000");
  await next();
  await expect(page.getByText(/ステップ5 \/ 9/)).toBeVisible();
  // ステップ5〜7は単元の答えに合わせて進める
  const unit = JSON.parse(fs.readFileSync(".velite/units.json", "utf8")).find((u: { id: string }) => u.id === "receivables-and-payables/loans");
  const accounts: { id: string; name: string }[] = JSON.parse(fs.readFileSync(".velite/accounts.json", "utf8")).accounts;
  const nameOf = (id: string) => accounts.find((a) => a.id === id)!.name;
  const ELEMENT_LABELS: Record<string, string> = { asset: "資産", liability: "負債", equity: "純資産", revenue: "収益", expense: "費用" };
  for (let i = 4; i < 7; i++) {
    const t = unit.steps[i].task;
    if (t.type === "post") await post(nameOf(t.answer.debit[0].account), nameOf(t.answer.credit[0].account), String(t.answer.debit[0].amount));
    else if (t.type === "calc") {
      await work.getByPlaceholder(/^金額\(/).fill(String(t.answer));
      await work.getByRole("button", { name: "確認する" }).click();
    } else if (t.type === "predict") {
      for (const [el, v] of Object.entries(t.answer)) await work.getByLabel(`${ELEMENT_LABELS[el]}の予想`, { exact: true }).selectOption(v as string);
      await work.getByRole("button", { name: "予想して記帳する" }).click();
    }
    await expect(page.getByText("できました", { exact: true }).first()).toBeVisible();
    await next();
  }
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["貸付金", "資産"], ["借入金", "負債"], ["受取利息", "収益"], ["支払利息", "費用"]]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  for (const theme of THEMES) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    for (const chip of CHIPS) {
      const { lines, overflow } = await board.getByRole("button", { name: chip, exact: true }).evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const bin = el.closest("[data-drop]")!.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return { lines: new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size, overflow: box.right > bin.right + 0.5 };
      });
      expect(lines, `${theme} ${chip}`).toBe(1);
      expect(overflow, `${theme} ${chip}がはみ出す`).toBe(false);
    }
  }
});
