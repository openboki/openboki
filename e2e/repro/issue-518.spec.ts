import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// 洗替法では同じ年に繰入と戻入を両方記帳するので、言い切りは差額補充法に限った言い方にする
test("貸倒れを見積もる: 繰入と戻入を同じ年に記帳しないという文が差額補充法に限られている", () => {
  const body = readFileSync("content/topics/bad-debts/allowance-for-doubtful-accounts.md", "utf8");
  expect(body).not.toContain("1つの年に繰入と戻入の両方を記帳することはありません。");
  const sentence = body.split("\n").find((line) => line.includes("5年目だけの損益計算書なら出るのは戻入3,000だけです"));
  expect(sentence).toContain("差額補充法では、1つの年に記帳するのは繰入か戻入のどちらか片方だけです。");
});
