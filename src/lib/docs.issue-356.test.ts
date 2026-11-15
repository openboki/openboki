import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// ADR 0006の改定(2026-11-15)とADR 0011に、ほかのドキュメントが食い違わないことを確かめる
const read = (path: string) => readFileSync(path, "utf8");

describe("ADR 0006 / 0011とドキュメントの整合(#356)", () => {
  it("ホスティングのリージョンを東京に限定しない", () => {
    expect(read("docs/architecture.md")).not.toContain("さくらのVPS 4GB(東京)");
  });

  it("architecture.md 7章が production からの公開、Umami、ビルド時の値を書いている", () => {
    const hosting = read("docs/architecture.md").split("## 7. ホスティング")[1].split("## 8.")[0];
    for (const word of ["`production`", "Umami", "`CONTENT_VERSION`", "`SITE_URL`"]) {
      expect(hosting).toContain(word);
    }
  });

  it("プレビューをCoolifyのPRデプロイと決めつけない", () => {
    const roadmap = read("docs/roadmap.md");
    expect(roadmap).not.toContain("CoolifyのPRデプロイ");
    expect(roadmap).not.toContain("プレビューもCoolifyで行う");
    expect(roadmap).toContain("リポジトリのメンバー");
    expect(roadmap).toContain("ADR 0011");
  });
});
