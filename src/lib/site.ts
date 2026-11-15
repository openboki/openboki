// 公開URL。OGP・sitemap・robotsの絶対URLに使う。静的生成されるページに焼き込まれるので、変えるときはビルド時に渡す。
// 既定を本番にしているのは、渡し忘れたビルドがlocalhostのURLを公開しないようにするため
export const SITE_URL = process.env.SITE_URL ?? "https://openboki.org";
