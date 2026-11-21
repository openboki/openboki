#!/usr/bin/env bash
# 変更されたファイルの一覧(標準入力、1行1パス)から、関門で回すE2Eの範囲を決める(ADR 0005)。
# 出力は full(全件)/ none(回さない)/ 回すspecのパス(1行1つ)。
#   git diff --name-only main...HEAD | scripts/e2e-scope.sh
# 単元の本文と誤解だけの変更は、基幹のspec(e2e/*.spec.ts)とその単元を開くreproに絞る。
# 範囲を決められない変更は全件に倒す。絞った分の取りこぼしはscripts/full-check.shが拾う。
set -eu
cd "$(dirname "$0")/.."

specs=""
smoke=0
add() { specs="$specs"$'\n'"$1"; }
# URLの断片を含むreproを足す。該当が無くてもよい
add_repro() { add "$(grep -rlF --include='*.spec.ts' -- "$1" e2e/repro || true)"; }

seen=0
while IFS= read -r f || [ -n "$f" ]; do
  [ -n "$f" ] || continue
  seen=1
  case "$f" in
    content/topics/*/topic.yaml)
      topic=${f#content/topics/}; topic=${topic%/topic.yaml}
      smoke=1; add_repro "/units/$topic/"; add_repro "/topics/$topic" ;;
    content/topics/*/*.md)
      unit=${f#content/topics/}; unit=${unit%.md}
      smoke=1; add_repro "/units/$unit" ;;
    # 誤解は参照する単元の誤答でしか表に出ない。その単元は同じ差分に入っているのが普通なので、基幹だけ足す
    content/misconceptions.yaml) smoke=1 ;;
    # 概念・勘定科目・学習パスは用語集やポップオーバーを通じて全単元に出る
    content/*) echo full; exit 0 ;;
    e2e/*.spec.ts) [ ! -f "$f" ] || add "$f" ;;
    # アプリの挙動に関わらないもの。単体テストはVitestが毎回回す
    docs/* | *.md | LICENSE* | .github/* | .claude/* | .agents/* | src/*.test.ts | src/*.test.tsx) ;;
    *) echo full; exit 0 ;;
  esac
done
# 差分が無い(mainそのもの)なら比べる相手が無いので全件
[ "$seen" = 1 ] || { echo full; exit 0; }

if [ "$smoke" = 1 ]; then for s in e2e/*.spec.ts; do add "$s"; done; fi
specs=$(printf '%s\n' "$specs" | sed '/^$/d' | sort -u)
if [ -n "$specs" ]; then printf '%s\n' "$specs"; else echo none; fi
