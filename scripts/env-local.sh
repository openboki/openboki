#!/usr/bin/env bash
# 起動中のローカルSupabaseから .env.localを作る(worktreeでビルドとE2Eを回すため)。
# 書くのはブラウザに配る公開値(URLとanonキー)だけで、値は画面に出さない。既にあれば何もしない。
set -eu
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  echo "[env-local] .env.localは既にあります"
  exit 0
fi
status=$(pnpm exec supabase status -o env 2>/dev/null) || {
  echo "[env-local] ローカルSupabaseが起動していません。先にmake db-startを実行してください" >&2
  exit 1
}
value() { printf '%s\n' "$status" | sed -n "s/^$1=\"\{0,1\}\([^\"]*\)\"\{0,1\}\$/\1/p"; }
url=$(value API_URL)
anon=$(value ANON_KEY)
if [ -z "$url" ] || [ -z "$anon" ]; then
  echo "[env-local] supabase statusからAPI_URLとANON_KEYを読めませんでした" >&2
  exit 1
fi
umask 077
printf 'NEXT_PUBLIC_SUPABASE_URL=%s\nNEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$url" "$anon" > .env.local
echo "[env-local] .env.localを作りました"
