"use client";

import { type AccountInfo, type JournalEntry, ELEMENTS, computeImpact, formatAmount } from "@/lib/accounting";
import { ElementBadge } from "@/components/element-badge";

// 不正解のとき、学習者の仕訳の影響と期待される影響を5要素で並べる(docs/ide-design.md 3章「誤りの見せ方」)
// 5要素がすべて一致する誤答(同じ要素の中の科目違いや貸借逆)では、表が「合っている」と読めるので出さない(Issue #413)

// 食い違う行の印。色の差だけでは見分けにくいので、記号と背景でも示し、読み上げには「食い違い」と伝える(Issue #438)
export const DIFF_ROW_CLASS = "bg-diff-fg/10 text-diff-fg font-medium";

export function DiffMark({ differs }: { differs: boolean }) {
  return (
    <span className="inline-block w-3 text-center">
      {differs && (
        <>
          <span aria-hidden>≠</span>
          <span className="sr-only">食い違い</span>
        </>
      )}
    </span>
  );
}

export function ImpactCompare({ yours, expected, accounts }: { yours: JournalEntry; expected: JournalEntry; accounts: ReadonlyMap<string, AccountInfo> }) {
  const a = computeImpact(yours, accounts);
  const b = computeImpact(expected, accounts);
  const value = (impact: typeof a, el: (typeof ELEMENTS)[number]) => (el === "equity" ? impact.equityTotal : impact[el]);
  const fmt = (n: number) => (n > 0 ? `+${formatAmount(n)}` : n < 0 ? `−${formatAmount(-n)}` : "±0");
  if (ELEMENTS.every((el) => value(a, el) === value(b, el))) return null;
  return (
    <div className="rounded bg-background/70 p-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th scope="col" className="text-left font-normal">要素</th>
            <th scope="col" className="text-right font-normal">あなたの仕訳</th>
            <th scope="col" className="text-right font-normal">期待される動き</th>
          </tr>
        </thead>
        <tbody>
          {ELEMENTS.map((el) => {
            const ya = value(a, el);
            const ex = value(b, el);
            const differs = ya !== ex;
            return (
              <tr key={el} className={differs ? DIFF_ROW_CLASS : ""}>
                <td className="py-0.5"><DiffMark differs={differs} /><ElementBadge element={el} size="xs" /></td>
                <td className="text-right font-mono tabular-nums">{fmt(ya)}</td>
                <td className="text-right font-mono tabular-nums">{fmt(ex)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
