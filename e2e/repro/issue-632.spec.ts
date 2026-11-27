import { expect, test } from "@playwright/test";

// 「5つの要素と仕訳」で、当期純利益に売上だけの80000、資産の合計に純資産の1030000を答えると、
// 説明文は出るのに誤解が付かず「よくある思い込み」が出なかった(Issue #632)
test("当期純利益に売上だけ・資産の合計に純資産を答えると誤解が付く(5つの要素と仕訳 ステップ8・9)", async ({ page }) => {
  const work = page.getByRole("region", { name: "ワークスペース" });
  const next = () => page.getByRole("button", { name: "次へ →" }).first().click();
  const post = async (d: string, c: string, amount: string) => {
    await work.getByLabel("借方の科目1").fill(d);
    await work.getByLabel("借方の金額1").fill(amount);
    await work.getByLabel("貸方の科目1").fill(c);
    await work.getByLabel("貸方の金額1").fill(amount);
    await work.getByRole("button", { name: "記帳する" }).click();
    await next();
  };
  await page.goto("/units/bookkeeping-basics/five-elements");
  await page.getByRole("button", { name: "今はしない" }).click({ timeout: 5000 }).catch(() => {});
  await next();
  await post("現金", "資本金", "1000000");
  await work.getByLabel("資産の予想", { exact: true }).selectOption("none");
  await work.getByRole("button", { name: "予想して記帳する" }).click();
  await next();
  await post("現金", "借入金", "300000");
  await post("現金", "売上", "80000");
  await post("支払家賃", "現金", "50000");
  const board = work.getByRole("group", { name: "仕分けボード" });
  for (const [chip, box] of [["現金", "資産"], ["備品", "資産"], ["借入金", "負債"], ["資本金", "純資産"], ["売上", "収益"], ["支払家賃", "費用"]]) {
    await board.getByRole("button", { name: chip, exact: true }).click();
    await board.getByRole("button", { name: `${box} ← ここに入れる`, exact: true }).click();
  }
  await work.getByRole("button", { name: "確認する" }).click();
  await next();

  // ステップ8: 売上80,000をそのまま当期純利益と答える
  const amount = work.getByPlaceholder(/^金額\(/);
  await amount.fill("80000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText("よくある思い込み: 売上がそのままもうけ")).toBeVisible();

  await amount.fill("30000");
  await work.getByRole("button", { name: "確認する" }).click();
  await next();

  // ステップ9: 純資産の1,030,000を資産の合計と答える
  await amount.fill("1030000");
  await work.getByRole("button", { name: "確認する" }).click();
  await expect(page.getByText("もう一歩", { exact: true })).toBeVisible();
  await expect(page.getByText("よくある思い込み: 資産の合計と純資産の取り違え")).toBeVisible();
});
