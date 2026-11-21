import type { IllustrationName } from "./illustrations";

/** イラストが出る場所1つ。単元は1件にまとめ、どのステップかはdetailに書く */
export interface IllustrationUse {
  href: string;
  title: string;
  detail: string;
}

interface TopicLike {
  id: string;
  title: string;
  illustration?: IllustrationName;
}

interface PartyLike {
  illustration: IllustrationName;
}

interface UnitLike {
  id: string;
  title: string;
  steps: {
    illustration?: IllustrationName;
    figures: ({ type: "parties"; rows: { left: PartyLike; right: PartyLike }[] } | { type: string })[];
  }[];
}

/** コンテンツから、イラストごとの使用箇所を集める。並びはテーマ → 単元(渡された順) */
export function illustrationUses(topics: readonly TopicLike[], units: readonly UnitLike[]): Map<IllustrationName, IllustrationUse[]> {
  const uses = new Map<IllustrationName, IllustrationUse[]>();
  const add = (name: IllustrationName, use: IllustrationUse) => uses.set(name, [...(uses.get(name) ?? []), use]);

  for (const t of topics) {
    if (t.illustration) add(t.illustration, { href: `/topics/${t.id}`, title: t.title, detail: "テーマの絵" });
  }
  for (const u of units) {
    const headings = new Map<IllustrationName, number[]>();
    const figures = new Map<IllustrationName, number[]>();
    const note = (map: Map<IllustrationName, number[]>, name: IllustrationName, step: number) => {
      const steps = map.get(name) ?? [];
      if (!steps.includes(step)) map.set(name, [...steps, step]);
    };
    u.steps.forEach((s, i) => {
      if (s.illustration) note(headings, s.illustration, i + 1);
      for (const f of s.figures) {
        if (!("rows" in f)) continue;
        for (const row of f.rows) {
          note(figures, row.left.illustration, i + 1);
          note(figures, row.right.illustration, i + 1);
        }
      }
    });
    const names = new Set([...headings.keys(), ...figures.keys()]);
    for (const name of names) {
      const parts = [headings.get(name) && `ステップ${headings.get(name)!.join("・")}`, figures.get(name) && `ステップ${figures.get(name)!.join("・")}の図`].filter(Boolean);
      add(name, { href: `/units/${u.id}`, title: u.title, detail: parts.join("、") });
    }
  }
  return uses;
}
