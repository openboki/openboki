import type { Progress } from "@/lib/progress";
import { FIRST_UNIT_AFTER_TUTORIAL, TUTORIAL_UNIT_ID } from "@/lib/tutorial-store";

export interface HomeStartUnit {
  title: string;
  kind: string;
  nextId?: string;
}

export interface HomeStartTarget {
  label: string;
  unitId: string;
}

/** トップの最初の導線を進捗から決める。nullは進捗なし(チュートリアルを勧める)、"all-done"は全単元を完了済み。
 * unitsはコンテンツの順で並べて渡す(未完了の単元を探す順になる) */
export function homeStartTarget(
  units: Record<string, HomeStartUnit>,
  progress: Progress["units"],
  tourPending: boolean,
): HomeStartTarget | "all-done" | null {
  // コンテンツから消えた単元の進捗は無視する。ツアーが済んでいないチュートリアルは
  // 開くとステップ0から始まり直す(#44)ので、「続きから」を約束しない(Issue #317)
  const latest = Object.entries(progress)
    .filter(([id, u]) => units[id] && !(id === TUTORIAL_UNIT_ID && tourPending && u.status === "started"))
    .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt));
  const started = latest.find(([, u]) => u.status === "started");
  if (started) return { label: "続きから", unitId: started[0] };
  const completedId = latest[0]?.[0];
  if (!completedId) return null;
  const done = (id: string) => progress[id]?.status === "completed";
  const nextId = completedId === TUTORIAL_UNIT_ID ? FIRST_UNIT_AFTER_TUTORIAL : units[completedId].nextId;
  if (nextId && !done(nextId)) return { label: "次の単元へ", unitId: nextId };
  // テーマ末尾の単元や、次の単元を先に終えていた場合は、コンテンツの順で最初の未完了の単元へ(Issue #360)。
  // nextUnitと同じく、3級の単元から歴史の単元へ誘導しないよう同じkindを優先する
  const remaining = Object.keys(units).filter((id) => id !== TUTORIAL_UNIT_ID && !done(id));
  const kind = units[completedId].kind;
  const fallback = remaining.find((id) => units[id].kind === kind) ?? remaining[0];
  return fallback ? { label: "次の単元へ", unitId: fallback } : "all-done";
}
