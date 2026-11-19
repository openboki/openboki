# 外部素材の台帳

外部のイラスト・画像・フォントを追加するときは、ここに1行ずつ記録する(docs/visual-guidelines.md 7章)。スポットイラストは自作のSVGなので、ここには載らない。
サイトの「このサイトについて」(`src/app/about/page.tsx`)にも同じ素材を載せているので、追加・削除したら合わせて直す。

| ファイル | 出所 | ライセンス | 取得日 | 使用箇所 |
|---|---|---|---|---|
| (フォント)Noto Sans JP | Google Fonts | SIL Open Font License 1.1 | 2026-11-07 | テーマ「帳簿用紙」の本文(next/font、`src/themes/fonts.ts`) |
| (フォント)BIZ UDPGothic | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | テーマ「街の小さな会社」「藍と朱」の本文 |
| (フォント)Zen Maru Gothic | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | テーマ「街の小さな会社」の見出し |
| (フォント)Zen Kaku Gothic New | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | テーマ「藍と朱」の見出し |
| (フォント)Zen Old Mincho | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | テーマ「帳簿用紙」の見出し |
| (フォント)M PLUS 1 Code | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | テーマ「ワークベンチ」の全体 |
| (フォント)IBM Plex Mono | Google Fonts | SIL Open Font License 1.1 | 2026-11-08 | 金額などの等幅(ワークベンチ以外) |
| (フォント)Noto Sans CJK JP | 実行環境のシステムフォント(Noto CJK) | SIL Open Font License 1.1 | 2026-11-15 | OG画像の文字(`scripts/icons.mjs`が`src/app/opengraph-image.png`に描き込む。Noto Sans JPと同じ書体) |
| (アイコン)lucide-react | https://lucide.dev | ISC | 2026-11-07 | UIのアイコン |
