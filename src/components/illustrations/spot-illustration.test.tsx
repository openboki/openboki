import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ILLUSTRATION_NAMES } from "@/lib/illustrations";
import { SpotIllustration } from "./spot-illustration";

// 絵柄の決まり(docs/visual-guidelines.md 6章)のうち、機械で確かめられるもの。
// 形の良し悪しは`make illustrations`の見本を目で見て確かめる

const FILLS = ["fill-none", "fill-card", "fill-primary", "fill-brand-accent", "fill-foreground", "fill-[color-mix(in_srgb,var(--brand-accent)_28%,var(--card))]"];
const STROKES = ["stroke-foreground", "stroke-card"];
const WIDTHS = ["1.8", "2.5", "4", "5.5"];
const SHAPES = ["svg", "path", "rect", "circle", "ellipse"];

describe.each(ILLUSTRATION_NAMES)("スポットイラスト %s", (name) => {
  const html = renderToStaticMarkup(<SpotIllustration name={name} />);

  it("枠は120 × 120で、装飾として読み上げから外す", () => {
    expect(html).toContain('viewBox="0 0 120 120"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("使う要素はpath / rect / circle / ellipseだけ(文字、グラデーション、画像を入れない)", () => {
    const tags = [...html.matchAll(/<([a-zA-Z]+)/g)].map((m) => m[1]);
    expect(tags.filter((t) => !SHAPES.includes(t))).toEqual([]);
  });

  it("色はテーマのトークンのクラスだけで指定する", () => {
    const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));
    expect(classes.filter((c) => c.startsWith("fill-") && !FILLS.includes(c))).toEqual([]);
    expect(classes.filter((c) => c.startsWith("stroke-") && !STROKES.includes(c))).toEqual([]);
    expect(html).not.toMatch(/\s(fill|stroke|style|opacity|fill-opacity|stroke-opacity)="/);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/);
  });

  it("線の太さは決まった4つだけ", () => {
    const widths = [...html.matchAll(/stroke-width="([^"]*)"/g)].map((m) => m[1]);
    expect(widths.filter((w) => !WIDTHS.includes(w))).toEqual([]);
  });

  it("1点は25要素まで(76pxで潰れない細かさ)", () => {
    expect((html.match(/<(path|rect|circle|ellipse)/g) ?? []).length).toBeLessThanOrEqual(25);
  });
});
