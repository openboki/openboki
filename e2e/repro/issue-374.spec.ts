import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// 出典の『スンマ』の注記が「利益の元手への振り替え」を『スンマ』に帰していて、
// 次の単元の「『スンマ』は利益と損失のページを挟む」という説明と食い違っていた
test("航海の儲けと複式の発見の『スンマ』の注記が、利益と損失を経由する次の単元の説明と揃う", () => {
  const units = JSON.parse(readFileSync(".velite/units.json", "utf8"));
  const unit = units.find((u: { id: string }) => u.id === "birth-of-double-entry/venture-profit-and-double-entry");
  const summa = unit.sources.find((s: { title: string }) => s.title.includes("スンマ"));
  expect(summa.note).not.toContain("利益の元手への振り替え");
  expect(summa.note).toContain("利益と損失");
});
