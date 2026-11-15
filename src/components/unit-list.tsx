"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProgress, type UnitStatus } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";

// 単元の一覧に学習状況(未着手 / 学習中 / 完了)を重ねて表示する

export interface UnitListItem {
  id: string;
  title: string;
  level: string;
  summary?: string;
}

const STATUS_LABELS: Record<UnitStatus, string> = { started: "学習中", completed: "完了" };

export function UnitList({ units }: { units: UnitListItem[] }) {
  const [status, setStatus] = useState<Record<string, UnitStatus>>({});

  useEffect(() => {
    fetchProgress()
      .then((p) => p && setStatus(Object.fromEntries(Object.entries(p.units).map(([id, u]) => [id, u.status]))))
      .catch((e: Error) => console.error(e));
  }, []);

  return (
    <ol className="space-y-2">
      {units.map((u, i) => (
        <li key={u.id} className="flex items-baseline gap-3 rounded-md border px-3 py-2">
          <span className="w-6 text-right text-sm text-muted-foreground">{i + 1}</span>
          <div className="flex-1 min-w-0">
            {/* バッジは見出しの行に置き、説明文の幅を学習状況で変えない(#346) */}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Link href={`/units/${u.id}`} className="underline-offset-4 hover:underline">
                {u.title}
              </Link>
              <span className="ml-auto flex gap-2">
                <Badge variant="outline">{u.level}</Badge>
                {status[u.id] && <Badge variant={status[u.id] === "completed" ? "default" : "secondary"}>{STATUS_LABELS[status[u.id]]}</Badge>}
              </span>
            </div>
            {u.summary && <p className="text-xs text-muted-foreground">{u.summary}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
