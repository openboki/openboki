import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

type WrongPattern = { match: unknown; misconception?: string; no_misconception?: string; feedback: string };
type Task = { type: string; wrong_patterns?: WrongPattern[] };

const unitPath = "content/topics/cash-and-deposits/petty-cash.md";
const tasks = [...readFileSync(unitPath, "utf8").matchAll(/```task\n([\s\S]*?)```/g)].map((m) => parse(m[1]) as Task);
const misconceptionIds = new Set(
  (parse(readFileSync("content/misconceptions.yaml", "utf8")).misconceptions as { id: string }[]).map((m) => m.id),
);

// Issue #272: 単元が想定した誤答でも誤解IDが無いと「よくある思い込み」が出ず、attemptsの誤解IDもNULLになる。
// 貸借不一致以外の誤答パターンは、misconceptionかno_misconception(付けない理由)のどちらかを持つ
describe("細かい支払いを任せる の誤答パターン(Issue #272)", () => {
  const patterns = tasks.flatMap((task, step) =>
    (task.wrong_patterns ?? [])
      .filter((p) => !(typeof p.match === "object" && p.match !== null && "unbalanced" in p.match))
      .map((p) => ({ step, task: task.type, p })),
  );

  it("貸借不一致以外の誤答パターンがある", () => {
    expect(patterns.length).toBeGreaterThan(0);
  });

  it.each(patterns.map(({ step, task, p }) => [step, task, JSON.stringify(p.match), p]))(
    "課題%i(%s)の誤答%sに誤解IDか免除の理由がある",
    (_step, _task, _match, p) => {
      expect(Boolean(p.misconception) !== Boolean(p.no_misconception)).toBe(true);
      if (p.misconception) expect(misconceptionIds.has(p.misconception)).toBe(true);
    },
  );
});
