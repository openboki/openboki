import { SpotIllustration } from "@/components/illustrations/spot-illustration";
import type { IllustrationName } from "@/lib/illustrations";

// 当事者の図。自分の会社を左に固定し、相手とのあいだでお金や物がどちらへ動いたかを矢印で示す
// 貸す・借りる、売る・買うのように、立場で科目が変わる取引の向きを見せる

interface Party {
  illustration: IllustrationName;
  label: string;
}

export interface PartiesRow {
  left: Party;
  right: Party;
  direction: "left" | "right";
  label: string;
  note?: string;
}

function PartyMark({ party }: { party: Party }) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-0.5 text-center text-xs">
      <SpotIllustration name={party.illustration} className="w-12" />
      <span>{party.label}</span>
    </div>
  );
}

export function PartiesFigure({ rows }: { rows: PartiesRow[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row, i) => (
        <li key={i} className="flex items-center gap-1">
          <PartyMark party={row.left} />
          <div className="min-w-0 flex-1 text-center text-xs">
            <div className="font-semibold">{row.label}</div>
            <div className="flex items-center text-foreground" aria-hidden>
              {row.direction === "left" && <span className="-mr-1 leading-none">◀</span>}
              <span className="h-0.5 flex-1 bg-foreground" />
              {row.direction === "right" && <span className="-ml-1 leading-none">▶</span>}
            </div>
            {row.note && <div className="text-muted-foreground">{row.note}</div>}
          </div>
          <PartyMark party={row.right} />
        </li>
      ))}
    </ul>
  );
}
