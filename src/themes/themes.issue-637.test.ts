import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES } from "./index";

// 誤答の比較表で食い違う行(DIFF_ROW_CLASS = bg-diff-fg/10)は、文字と同じ色を10%重ねた背景の上に文字を置く。
// 表はbg-hintの「もう一歩」の箱に載り、postの表はさらにbg-background/70を挟む(impact-compare.tsx)。
// 無地の面だけを比べる検査では、この重ねた背景で4.5:1を割るのを見逃した(Issue #637)

type Rgb = [number, number, number];

function tokens(css: string, selector: string): Record<string, string> {
  const open = css.indexOf("{", css.indexOf(selector));
  const block = css.slice(open + 1, css.indexOf("}", open));
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const rgb = (hex: string): Rgb => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const over = (top: Rgb, below: Rgb, alpha: number): Rgb => top.map((v, i) => v * alpha + below[i] * (1 - alpha)) as Rgb;

function luminance(c: Rgb): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
}

function contrast(a: Rgb, b: Rgb): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

describe.each(THEMES.map((t) => [t.id] as const))("テーマ%sの食い違い行", (id) => {
  const css = readFileSync(path.join(__dirname, `${id}.css`), "utf8");
  for (const [mode, selector] of [
    ["ライト", `[data-theme="${id}"] {`],
    ["ダーク", `[data-theme="${id}"][data-mode="dark"] {`],
  ] as const) {
    const t = tokens(css, selector);
    const fg = rgb(t["diff-fg"]);
    const hint = rgb(t["hint-bg"]);
    const surfaces: [string, Rgb][] = [
      ["predictの表(hint-bgの上)", hint],
      ["postの表(hint-bgにbackground/70)", over(rgb(t.background), hint, 0.7)],
      ["background", rgb(t.background)],
      ["card", rgb(t.card)],
      ["surface-guide", rgb(t["surface-guide"])],
    ];
    it.each(surfaces)(`${mode}: %sに文字色を1割重ねた行で4.5:1以上`, (_, surface) => {
      expect(contrast(fg, over(fg, surface, 0.1))).toBeGreaterThanOrEqual(4.5);
    });
  }
});
