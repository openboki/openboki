import { expect, test, type Page } from "@playwright/test";

// 「預かったお金、仮のお金」ステップ8で、正体が分かった入金を普通預金 / 未収入金と書くと、
// 説明は出るが「よくある思い込み」(誤解)が付かない。ステップ7の予想では説明文が2つ重なる(Issue #599)
type Line = [string, string];

async function post(page: Page, debit: Line[], credit: Line[]) {
  const work = page.getByRole("region", { name: "ワークスペース" });
  for (const [side, lines] of [["借方", debit], ["貸方", credit]] as const) {
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await work.getByRole("button", { name: "行を追加" }).nth(side === "借方" ? 0 : 1).click();
      await work.getByLabel(`${side}の科目${i + 1}`).fill(lines[i][0]);
      await work.getByLabel(`${side}の金額${i + 1}`).fill(lines[i][1]);
    }
  }
  await work.getByRole("button", { name: "記帳する" }).click();
}

async function predict(page: Page, picks: Record<string, string>) {
  for (const name of ["資産", "負債", "純資産", "収益", "費用"])
    await page.getByLabel(`${name}の予想`, { exact: true }).selectOption({ label: picks[name] ?? "変わらない" });
  await page.getByRole("button", { name: "予想して記帳する" }).click();
}

test("正体の分かった入金で普通預金をもう一度増やす誤答に誤解の説明が付き、予想の誤答の説明は重ならない", async ({ page }) => {
  await page.goto("/units/receivables-and-payables/temporary-and-deposits");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  const next = page.getByRole("button", { name: "次へ →" });
  const done = page.getByRole("status").filter({ hasText: "できました" });
  const status = page.getByRole("status").filter({ hasText: "もう一歩" });
  const steps: (() => Promise<void>)[] = [
    () => post(page, [["給料", "100000"]], [["普通預金", "97000"], ["預り金", "3000"]]),
    () => predict(page, { 資産: "減る", 負債: "減る" }),
    () => post(page, [["立替金", "2000"]], [["現金", "2000"]]),
    () => post(page, [["仮払金", "20000"]], [["現金", "20000"]]),
    () => post(page, [["旅費交通費", "18000"], ["現金", "2000"]], [["仮払金", "20000"]]),
  ];
  for (const solve of steps) {
    await next.click();
    await solve();
    await expect(done).toBeVisible();
  }

  // ステップ7: 売上と見て負債を「変わらない」にすると、説明は売上の1文だけ
  await next.click();
  await predict(page, { 資産: "増える", 収益: "増える" });
  await expect(status).toContainText("仮受金という負債に置いて、理由を調べます");
  await expect(status).not.toContainText("返すことになるかもしれないお金");
  await expect(status).toContainText("正体不明の入金は売上");

  // ステップ8: 入金をもう一度書く(予想は外れても記帳済みなので、そのまま次へ進める)
  await next.click();
  await post(page, [["普通預金", "50000"]], [["未収入金", "50000"]]);
  await expect(status).toContainText("普通預金は入金のときに増やしてあります");
  await expect(status).toContainText("よくある思い込み");
  await expect(status).toContainText("分かった日に仮勘定を消さない");
});
