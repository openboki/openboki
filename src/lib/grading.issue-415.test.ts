import { describe, expect, it } from "vitest";
import { misconceptionMap, unitMap } from "./content";
import { gradePost } from "./grading";

// Issue #415: ニッコロの代わりにジョヴァンニを書くと、相手違いの説明が無く「左と右を見直して」の汎用文だけが出ていた
describe("ヴェネツィア式とパチョーリ ステップ3の人名勘定の相手違い", () => {
  const task = () => {
    const t = unitMap.get("birth-of-double-entry/venetian-method-and-pacioli")!.steps[2].task;
    if (t?.type !== "post") throw new Error("postではない");
    return t;
  };

  it("貸方をジョヴァンニにすると、相手を取り違える誤解と相手を指す説明を返す", () => {
    const r = gradePost(task(), { debit: [{ account: "cloth_venture", amount: 100 }], credit: [{ account: "giovanni", amount: 100 }] }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("personal_account_wrong_party");
    expect(r.feedback).toContain("ニッコロ");
    expect(r.feedback).not.toContain("左と右に書くかを見直して");
    expect(misconceptionMap.get("personal_account_wrong_party")?.name).toBe("人名勘定の相手を取り違える");
  });

  it("左右も相手も違う(借方ジョヴァンニ・貸方絹)答えにも同じ誤解を返す", () => {
    const r = gradePost(task(), { debit: [{ account: "giovanni", amount: 100 }], credit: [{ account: "cloth_venture", amount: 100 }] }, undefined, "history");
    expect(r.correct).toBe(false);
    expect(r.misconception).toBe("personal_account_wrong_party");
    expect(r.feedback).toContain("ニッコロ");
  });

  it("貸借逆(借方ニッコロ・貸方絹)は従来どおり後払いの誤解を返す", () => {
    const r = gradePost(task(), { debit: [{ account: "niccolo", amount: 100 }], credit: [{ account: "cloth_venture", amount: 100 }] }, undefined, "history");
    expect(r.misconception).toBe("credit_purchase_as_claim");
  });
});
