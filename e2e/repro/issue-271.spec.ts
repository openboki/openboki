import { expect, test } from "@playwright/test";

// Issue #271: 品目名の「切手代」が通信費の別名として受け付けられ、科目の振り分けを問うステップが素通りになっていた
test("小口現金の報告で借方を「切手代」と書いても正解にしない", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = page.getByRole("button", { name: "次へ →" });
  await page.goto("/units/cash-and-deposits/petty-cash");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next.click();
  await work.getByLabel("借方の科目1").fill("小口現金");
  await work.getByLabel("借方の金額1").fill("30000");
  await work.getByLabel("貸方の科目1").fill("当座預金");
  await work.getByLabel("貸方の金額1").fill("30000");
  await work.getByRole("button", { name: "記帳する" }).click();
  await expect(page.getByText("できました", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await expect(page.getByText("ステップ4 / 9")).toBeVisible();
  const lines = [
    ["切手代", "4000"],
    ["消耗品費", "6500"],
    ["旅費交通費", "2000"],
  ];
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) await work.getByRole("button", { name: "行を追加" }).first().click();
    await work.getByLabel(`借方の科目${i + 1}`).fill(lines[i][0]);
    await work.getByLabel(`借方の金額${i + 1}`).fill(lines[i][1]);
  }
  await work.getByLabel("貸方の科目1").fill("小口現金");
  await work.getByLabel("貸方の金額1").fill("12500");
  const post = work.getByRole("button", { name: "記帳する" });
  // 科目として読まれず記帳できない、または記帳しても「できました」にならない
  if (await post.isEnabled()) {
    await post.click();
    await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  }
  await expect(page.getByText("できました", { exact: true })).toHaveCount(0);
});
