import { describe, expect, it } from "vitest";
import { accountMap, unitMap } from "./content";
import { gradeClassify } from "./grading";

// Issue #417: 箱のラベルが動詞句(「貸倒れとして処理する」)でも、正解の箱を示す一文が日本語として読める
describe("貸倒れの仕分けボードの案内", () => {
  const t = unitMap.get("bad-debts/bad-debt-loss")!.steps[5].task;
  if (t.type !== "classify") throw new Error("classifyではない");

  it("逆の箱に入れた項目の案内がラベルを「〜の箱です」で示す", () => {
    const r = gradeClassify(t, { bankrupt: "not_bad_debt", late: "bad_debt", returned: "bad_debt", vanished: "not_bad_debt" }, accountMap);
    expect(r.correct).toBe(false);
    const feedbacks = r.wrong.map((w) => w.feedback);
    expect(feedbacks).toContain("「得意先が倒産し、売掛金を受け取れないと決まった」は「貸倒れとして処理する」の箱です。");
    expect(feedbacks).toContain("「得意先の支払いが約束より1か月遅れている」は「貸倒れではない」の箱です。");
    for (const f of feedbacks) {
      expect(f).not.toContain("処理するです");
      expect(f).not.toContain("ではないです");
    }
  });
});
