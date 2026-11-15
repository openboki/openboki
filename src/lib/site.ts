import type { Metadata } from "next";

// 公開URL。OGP・sitemap・robotsの絶対URLに使う。静的生成されるページに焼き込まれるので、変えるときはビルド時に渡す。
// 既定を本番にしているのは、渡し忘れたビルドがlocalhostのURLを公開しないようにするため
export const SITE_URL = process.env.SITE_URL ?? "https://openboki.org";

// ページごとのtitle・description・正規URL。
// og:urlは付けない。ページでopenGraphを書くとlayoutの値とOG画像が引き継がれなくなるため
export function pageMetadata({ path, title, description, noindex }: { path: string; title?: string; description?: string; noindex?: boolean }): Metadata {
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: { canonical: path },
    ...(noindex && { robots: { index: false } }),
  };
}
