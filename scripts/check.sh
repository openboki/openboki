#!/usr/bin/env bash
# ローカルの品質確認を一括で回す(ADR 0005)。issue-agentの関門と、実装側のClaudeが使う。
#   scripts/check.sh                # lint / typecheck / test / build / E2E(mainとの差分に応じた範囲)
#   CHECK_E2E=full scripts/check.sh # E2Eを全件(productionを進める前、issue-loopの終了時)
#   CHECK_E2E=0 scripts/check.sh    # E2Eを省く
# E2Eは本番ビルドをE2E_PORT(既定3100。開発サーバーの3000と並走できる)で起動して回す。
set -eu
cd "$(dirname "$0")/.."
echo "[check] lint"; pnpm lint
echo "[check] typecheck"; pnpm typecheck
echo "[check] test"; pnpm test
echo "[check] build"; pnpm build
scope=${CHECK_E2E:-changed}
if [ "$scope" = changed ] || [ "$scope" = 1 ]; then
  # コミット済みの差分に、作業ツリーの変更と未追跡のファイルを足す
  scope=$({ git diff --name-only main...HEAD; git diff --name-only HEAD; git ls-files --others --exclude-standard; } | scripts/e2e-scope.sh)
fi
case "$scope" in
  0 | none) echo "[check] e2e: 対象なし" ;;
  full)
    echo "[check] e2e: 全件 (port ${E2E_PORT:-3100})"
    E2E_SERVER=start E2E_PORT="${E2E_PORT:-3100}" pnpm exec playwright test ;;
  *)
    echo "[check] e2e: $(printf '%s\n' "$scope" | wc -l)ファイル (port ${E2E_PORT:-3100})"
    # shellcheck disable=SC2086
    E2E_SERVER=start E2E_PORT="${E2E_PORT:-3100}" pnpm exec playwright test $scope ;;
esac
echo "[check] ok"
