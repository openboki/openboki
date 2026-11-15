import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Issue #350: 本番用のDockerfile。実際のdocker buildは重いので、イメージの中身を決める記述を検査する
const dockerfile = readFileSync("Dockerfile", "utf8");
const dockerignore = readFileSync(".dockerignore", "utf8").split("\n").map((l) => l.trim());
const runner = dockerfile.slice(dockerfile.lastIndexOf("FROM "));

describe("Dockerfile(Issue #350)", () => {
  it("ビルド時に焼き込まれる値をbuild-argで受ける", () => {
    for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "CONTENT_VERSION"]) {
      expect(dockerfile).toMatch(new RegExp(`^ARG ${name}$`, "m"));
    }
    expect(dockerfile).toMatch(/^ARG SITE_URL=https:\/\/openboki\.org$/m);
  });

  it("ビルドはvelite && next build(pnpm build)", () => {
    expect(dockerfile).toMatch(/^RUN pnpm build$/m);
  });

  it("実行用のステージにはstandaloneの成果物とpublicだけを入れる", () => {
    const copies = runner.split("\n").filter((l) => l.startsWith("COPY"));
    expect(copies.map((l) => l.split(" ").slice(-2).join(" "))).toEqual([
      "/app/.next/standalone ./",
      "/app/.next/static ./.next/static",
      "/app/public ./public",
    ]);
    expect(copies.every((l) => l.includes("--from=build"))).toBe(true);
    expect(runner).not.toMatch(/pnpm install/);
  });

  it(".env*と.gitをビルドコンテキストに入れない", () => {
    expect(dockerignore).toContain(".env*");
    expect(dockerignore).toContain(".git");
    expect(dockerignore).toContain("node_modules");
  });
});
