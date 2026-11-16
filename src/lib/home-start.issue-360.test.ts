import { describe, expect, it } from "vitest";
import { homeStartTarget, type HomeStartUnit } from "./home-start";
import type { Progress } from "./progress";

// Issue #360: 次の単元が無い単元を完了すると、トップが初めての人向けの「チュートリアルを始める」に戻っていた
// キーの順はコンテンツの順(page.tsxと同じく、非表示テーマのチュートリアルは後ろ)
const units: Record<string, HomeStartUnit> = {
  "basics/a": { title: "A", kind: "lesson", nextId: "basics/b" },
  "basics/b": { title: "B", kind: "lesson", nextId: "assets/c" },
  "assets/c": { title: "C", kind: "lesson" },
  "history/h": { title: "H", kind: "history" },
  "tutorial/first-entry": { title: "チュートリアル", kind: "lesson" },
};

const done = (updatedAt: string) => ({ status: "completed" as const, step: 1, updatedAt });

describe("トップの最初の導線", () => {
  it("次の単元が無い単元だけを完了したら、最初の未完了の単元へ進める", () => {
    const progress: Progress["units"] = { "assets/c": done("2026-11-15T10:00:00Z") };
    expect(homeStartTarget(units, progress, false)).toEqual({ label: "次の単元へ", unitId: "basics/a" });
  });

  it("次の単元も完了済みなら、その先の未完了の単元へ進める", () => {
    const progress: Progress["units"] = {
      "basics/a": done("2026-11-15T09:00:00Z"),
      "assets/c": done("2026-11-15T08:00:00Z"),
      "basics/b": done("2026-11-15T10:00:00Z"),
    };
    expect(homeStartTarget(units, progress, false)).toEqual({ label: "次の単元へ", unitId: "history/h" });
  });

  it("同じkindの未完了の単元を優先する", () => {
    const progress: Progress["units"] = { "history/h": done("2026-11-15T10:00:00Z") };
    expect(homeStartTarget(units, progress, false)).toEqual({ label: "次の単元へ", unitId: "basics/a" });
    const lessons: Progress["units"] = { "basics/b": done("2026-11-15T09:00:00Z"), "assets/c": done("2026-11-15T10:00:00Z") };
    expect(homeStartTarget(units, lessons, false)).toEqual({ label: "次の単元へ", unitId: "basics/a" });
  });

  it("全単元を完了したら、チュートリアルを勧めない", () => {
    const progress = Object.fromEntries(
      ["basics/a", "basics/b", "assets/c", "history/h"].map((id, i) => [id, done(`2026-11-15T1${i}:00:00Z`)]),
    );
    expect(homeStartTarget(units, progress, false)).toBe("all-done");
  });

  it("進捗が無ければチュートリアルを勧める", () => {
    expect(homeStartTarget(units, {}, false)).toBeNull();
  });
});
