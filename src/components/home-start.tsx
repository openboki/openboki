"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProgress } from "@/lib/progress";
import { TUTORIAL_UNIT_ID, useTutorialState } from "@/lib/tutorial-store";
import { homeStartTarget, type HomeStartTarget, type HomeStartUnit } from "@/lib/home-start";
import { Button } from "@/components/ui/button";

// トップページの最初の導線。初めての人にはチュートリアル、進捗がある人には続きの単元を出す(Issue #301)

export function HomeStart({ units }: { units: Record<string, HomeStartUnit> }) {
  // nullは進捗なし(チュートリアル)。読み込む前にチュートリアルを押せると、学習中の人もツアーへ飛ぶ(Issue #441)
  const [target, setTarget] = useState<HomeStartTarget | "all-done" | "loading" | null>("loading");
  const tourPending = useTutorialState().status === "pending";

  useEffect(() => {
    // 水和の直後はtutorialがサーバーの値(done)なので、その回の結果は捨てる
    let cancelled = false;
    fetchProgress()
      .then((p) => {
        if (cancelled) return;
        setTarget(p ? homeStartTarget(units, p.units, tourPending) : null);
      })
      .catch((e: Error) => {
        console.error(e);
        if (!cancelled) setTarget(null);
      });
    return () => {
      cancelled = true;
    };
  }, [units, tourPending]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {target === "all-done" ? null : target === "loading" ? (
          <Button size="lg" disabled>
            読み込み中…
          </Button>
        ) : target ? (
          <Button size="lg" asChild>
            {/* 「続きから」は前回のステップを開く約束なので、IDEに再開を指示する(Issue #375) */}
            <Link href={`/units/${target.unitId}${target.label === "続きから" ? "?resume=1" : ""}`}>
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
      {target === null && <p className="text-sm text-muted-foreground">1件の仕訳を記帳して、画面の使い方を体験します。</p>}
    </div>
  );
}
