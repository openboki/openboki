import { formatAmount } from "@/lib/accounting";
import { ELEMENT_STYLE } from "@/lib/elements";

// 期間と配分。合計をn期に等分し、各期の額を帯で見せる(費用配分の図)。
// highlightを書くと先頭からその数の期だけを費用の色で描き、残りは枠だけにする。startMonthを書くと期の名前を月にする

export function TimelineFigure({
  total,
  periods,
  unit,
  label,
  highlight,
  startMonth,
}: {
  total: number;
  periods: number;
  unit: string;
  label?: string;
  highlight?: number;
  startMonth?: number;
}) {
  const each = Math.floor(total / periods);
  const amount = formatAmount(each);
  const style = ELEMENT_STYLE.expense;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{label ?? `合計${formatAmount(total)}円を${periods}${unit}に分ける`}</span>
        <span className="text-xs text-muted-foreground">1{unit}あたり{amount}円</span>
      </div>
      {/* テーマごとに等幅フォントが違うので、列の最小幅は金額の文字数 + 余白ぶんをchで取り、ペインが狭ければ折り返す */}
      <ol className="grid gap-1 font-mono text-xs" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${amount.length + 2}ch, 1fr))` }}>
        {Array.from({ length: periods }, (_, i) => {
          const on = highlight === undefined || i < highlight;
          return (
            <li
              key={i}
              data-highlight={highlight === undefined ? undefined : on}
              className={`rounded border px-1 py-2 text-center ${on ? `${style.bg} ${style.border}` : "border-dashed bg-background"}`}
            >
              <div className="font-sans text-[10px] text-muted-foreground">{startMonth ? `${((startMonth - 1 + i) % 12) + 1}月` : `${i + 1}${unit}目`}</div>
              <div className={`tabular-nums ${on ? `font-medium ${style.text}` : "text-muted-foreground"}`}>{amount}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
