import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// Issue #319: 「自由に試す」の記帳は見出しの下のとおり再読み込みで消える(通常の単元)

const id = "merchandise/returns-and-costs";
const unit = JSON.parse(readFileSync(".velite/units.json", "utf8")).find((u: { id: string }) => u.id === id);
const accounts = JSON.parse(readFileSync(".velite/accounts.json", "utf8")).accounts as { id: string; name: string; element: string }[];
const nameOf = (a: string) => accounts.find((x) => x.id === a)!.name;
const box = { asset: "資産", liability: "負債", equity: "純資産", revenue: "収益", expense: "費用" } as Record<string, string>;
type Line = { account: string; amount: number };

test("通常の単元の「自由に試す」で記帳した仕訳は、再読み込みで消える", async ({ page }) => {
  await page.goto(`/units/${id}`);
  await page.getByRole("button", { name: "今はしない" }).click();
  const work = page.getByRole("region", { name: "ワークスペース" });
  const done = page.getByRole("status").filter({ hasText: "できました" }).first();
  const fill = async (entry: { debit: Line[]; credit: Line[] }) => {
    for (const [side, lines] of [["借方", entry.debit], ["貸方", entry.credit]] as const) {
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
        await work.getByLabel(`${side}の科目${i + 1}`).fill(nameOf(lines[i].account));
        await work.getByLabel(`${side}の金額${i + 1}`).fill(String(lines[i].amount));
      }
    }
  };
  for (const step of unit.steps.slice(0, -1)) {
    const task = step.task;
    if (task.type === "post") {
      await fill(task.answer);
      await work.getByRole("button", { name: "記帳する", exact: true }).click();
    } else if (task.type === "calc") {
      await work.getByPlaceholder(/金額/).fill(String(task.answer));
      await work.getByRole("button", { name: "確認する" }).click();
    } else if (task.type === "classify") {
      const board = page.getByRole("group", { name: "仕分けボード" });
      for (const a of task.accounts as string[]) {
        await board.getByRole("button", { name: nameOf(a), exact: true }).click();
        await board.getByRole("button", { name: new RegExp(`^${box[accounts.find((x) => x.id === a)!.element]}( |$)`) }).click();
      }
      await work.getByRole("button", { name: "確認する" }).click();
    }
    if (task.type !== "observe") await expect(done).toBeVisible();
    await page.getByRole("button", { name: "次へ →" }).click();
  }
  await expect(page.getByText(`ステップ${unit.steps.length} / ${unit.steps.length}`)).toBeVisible();
  await expect(work.locator('[data-tour="task-sandbox"]')).toContainText("再読み込みすると消えます");

  await work.getByLabel("借方の科目1").fill("現金");
  await work.getByLabel("借方の金額1").fill("1234");
  await work.getByLabel("貸方の科目1").fill("売上");
  await work.getByLabel("貸方の金額1").fill("1234");
  await work.getByRole("button", { name: "記帳する", exact: true }).click();
  const journal = work.getByRole("tabpanel", { name: "仕訳帳(記帳済み)" });
  await expect(journal).toContainText("1,234");

  await page.reload();
  await expect(page.getByText(`ステップ${unit.steps.length} / ${unit.steps.length}`)).toBeVisible();
  await expect(journal).toContainText("返品");
  await expect(journal).not.toContainText("1,234");
});
