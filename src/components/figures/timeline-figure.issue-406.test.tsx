import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TimelineFigure } from "./timeline-figure";

// Issue #406: 年表図の強調と月の名前。指定が無い図は従来の見た目のまま
describe("TimelineFigure", () => {
  it("指定が無ければ「1年目」〜で、強調の区別を持たない", () => {
    const html = renderToStaticMarkup(<TimelineFigure total={1200000} periods={4} unit="年" />);
    expect(html).toContain("1年目");
    expect(html).toContain("4年目");
    expect(html).not.toContain("data-highlight");
    expect(html).not.toContain("border-dashed");
  });
  it("start_monthが4なら「4月」から始まり、12月の次は1月になる", () => {
    const html = renderToStaticMarkup(<TimelineFigure total={120000} periods={12} unit="か月" highlight={6} startMonth={4} />);
    const labels = [...html.matchAll(/>(\d+月)</g)].map((m) => m[1]);
    expect(labels).toEqual(["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"]);
    expect(html.match(/data-highlight="true"/g)).toHaveLength(6);
    expect(html.match(/data-highlight="false"/g)).toHaveLength(6);
  });
});
