#!/usr/bin/env bash
# productionをmain(引数で別のコミットも指定できる)までfast-forwardで進める。pushを受けてDeployのワークフローが動く(ADR 0006)。
# 進めるのは、E2Eを全件つきで関門を通ったコミットだけ(scripts/full-check.sh)。
#   scripts/publish.sh [コミット]
set -eu
cd "$(dirname "$0")/.."
git fetch -q origin
sha=$(git rev-parse --verify "${1:-origin/main}^{commit}")
git merge-base --is-ancestor "$sha" origin/main || { echo "[publish] $shaはorigin/mainに無いコミットです"; exit 1; }
if git rev-parse -q --verify origin/production >/dev/null; then
  [ "$(git rev-parse origin/production)" != "$sha" ] || { echo "[publish] productionは既に$shaです"; exit 0; }
  git merge-base --is-ancestor origin/production "$sha" || { echo "[publish] $shaはproductionより前のコミットです。巻き戻しはdocs/deployment.mdの手順で行います"; exit 1; }
fi
scripts/full-check.sh "$sha"
# forceは付けない。fast-forwardにならないpushはGitHubが拒む
git push origin "$sha:refs/heads/production"
echo "[publish] productionを$shaへ進めました。デプロイはGitHubのActionsで承認すると始まります"
