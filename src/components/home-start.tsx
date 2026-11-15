"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProgress } from "@/lib/progress";
import { FIRST_UNIT_AFTER_TUTORIAL, TUTORIAL_UNIT_ID } from "@/lib/tutorial-store";
import { Button } from "@/components/ui/button";

// トップページの最初の導線。初めての人にはチュートリアル、進捗がある人には続きの単元を出す(Issue #301)

export interface HomeStartUnit {
  title: string;
  nextId?: string;
}

interface Target {
  label: string;
  unitId: string;
}

export function HomeStart({ units }: { units: Record<string, HomeStartUnit> }) {
  // サーバー描画と進捗の無い閲覧者にはチュートリアルを出すので、nullを既定にする
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    fetchProgress()
      .then((p) => {
        if (!p) return;
        // コンテンツから消えた単元の進捗は無視する
        const latest = Object.entries(p.units)
          .filter(([id]) => units[id])
          .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt));
        const started = latest.find(([, u]) => u.status === "started");
        if (started) return setTarget({ label: "続きから", unitId: started[0] });
        const completedId = latest[0]?.[0];
        if (!completedId) return;
        const nextId = completedId === TUTORIAL_UNIT_ID ? FIRST_UNIT_AFTER_TUTORIAL : units[completedId].nextId;
        if (nextId && p.units[nextId]?.status !== "completed") setTarget({ label: "次の単元へ", unitId: nextId });
      })
      .catch((e: Error) => console.error(e));
  }, [units]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {target ? (
          <Button size="lg" asChild>
            <Link href={`/units/${target.unitId}`}>
              {target.label}: {units[target.unitId].title}
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            {/* スキップ済みでもツアーを始めるため、「使い方」のやり直しと同じ?tour=1で開く(Issue #311) */}
            <Link href={`/units/${TUTORIAL_UNIT_ID}?tour=1`}>チュートリアルを始める</Link>
          </Button>
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/paths/boki-3">3級合格パスを見る</Link>
        </Button>
      </div>
      {!target && <p className="text-sm text-muted-foreground">1件の仕訳を記帳して、画面の使い方を体験します。</p>}
    </div>
  );
}
