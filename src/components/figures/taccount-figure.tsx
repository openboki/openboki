import type { ReactNode } from "react";
import { type AccountInfo, accountIncreaseSide, formatAmount } from "@/lib/accounting";
import { ELEMENT_STYLE } from "@/lib/elements";

// T勘定。左が借方、右が貸方。その科目が増える側に印を付ける

interface Line {
  label: string;
  amount: number;
}

/** nameはIDEの結果ペインで科目名を用語のトリガーに差し替えるときに渡す */
export function TAccountFigure({ account, name, debit, credit }: { account: AccountInfo; name?: ReactNode; debit: Line[]; credit: Line[] }) {
  const s = ELEMENT_STYLE[account.element];
  // 仮勘定はどの要素でもないので、要素の色と記号も増える側も示さない(ElementBadgeと同じ扱い)
  const temporary = account.temporary === true;
  // 口別の勘定は左がかかった額、右が売った額で、どちらかが増える側ではない(Issue #420)
  const plain = temporary || account.mixed === true;
  const inc = plain ? null : accountIncreaseSide(account);
  const sum = (lines: Line[]) => lines.reduce((t, l) => t + l.amount, 0);
  const balance = sum(debit) - sum(credit);
  const side = (title: string, lines: Line[], isIncrease: boolean) => (
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-semibold px-1 ${isIncrease ? s.text : "text-muted-foreground"}`}>
        {title}
        {isIncrease && <span className="ml-1 font-normal">(増える側)</span>}
      </div>
      <ul className="text-xs font-mono tabular-nums">
        {lines.map((l, i) => (
          // 摘要が金額と並ばないほど長いときは摘要を1行に広げ、金額を次の行の右端に送る
          <li key={i} className="flex flex-wrap gap-x-2 px-1">
            <span className="min-w-0 break-words">{l.label}</span>
            <span className="ml-auto shrink-0">{formatAmount(l.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="text-sm">
      <div className={`inline-flex items-center rounded-t-md border border-b-0 px-2 py-0.5 text-xs font-semibold ${plain ? "text-muted-foreground" : `gap-1 ${s.bg} ${s.border} ${s.text}`}`}>
        {!plain && <span aria-hidden>{s.symbol}</span>}
        {name ?? account.name}
        {temporary && "(仮)"}
      </div>
      <div className="flex divide-x border-t-2 border-foreground/70">
        {side("借方", debit, inc === "debit")}
        {side("貸方", credit, inc === "credit")}
      </div>
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {/* 0にはどちらの側もない */}
        残高{formatAmount(Math.abs(balance))}
        {balance !== 0 && `(${balance > 0 ? "借方" : "貸方"})`}
      </div>
    </div>
  );
}
