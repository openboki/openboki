# 開発の進め方(Issueを作業単位の正とする)

方向はdocsが持ち、作業単位はGitHub Issuesが持ち、実行は誰がやっても同じ関門を通る。
マイルストーンは`docs/roadmap.md`、統合の決まりはADR 0012、無人ループの設計と運用は`docs/quality-loop.md`。

| 層 | 置き場所 | 決める人 | 内容 |
|---|---|---|---|
| 方向 | `docs/roadmap.md`、vision、requirements、ADR | 人 | マイルストーン、何を検証するか、設計判断 |
| 作業単位 | GitHub Issues | 人が切る(不具合はMonkeyが起票) | 1単元、1機能のスライス、1不具合。受け入れ条件つき |
| 実行 | worktree → `make check` → PRのsquashで`main` | 人のセッション、並列セッション、夜間ループのどれでも | 同じ関門(lint / 型 / テスト / ビルド / 差分に応じた範囲のE2E)を通す |

## 流れ

1. マイルストーンの着手時に、roadmapの項目をIssueに分解する。1 Issueは1セッションか1晩で終わる大きさにし、受け入れ条件を本文に書く。
2. ラベルを付ける。種別は`type:bug` / `type:feature` / `type:content`。担当は`ready-for-agent`(Agent Briefつきで無人可)か`ready-for-human`(判断が要る)。不具合だけ`needs-triage`から始め、`triage-agent.sh`が再現して振り分ける。
3. 実行する。人はClaude Codeのセッション(VS Codeのタブ)ごとにIssueを1つ取り、worktreeで進める。夜は`scripts/issue-loop.sh`が`ready-for-agent`を古い順に処理する。取ったIssueには`agent:in-progress`を付け、人とループが衝突しないようにする。
4. `make check`を通し、PRをsquashでマージする。mainは直線の履歴で、1コミット = 1 Issue、件名は`<Issueの題名> (#N)`(ADR 0012)。PRの`Closes #n`でIssueを閉じる。翌晩のMonkeyと`scripts/issue-verify.sh`が回帰を拾う。
5. マイルストーンの項目が全部閉じたらroadmapにチェックを入れる。

## 誰が何を取るか

- 人のセッション: 新しい種類の最初の1件(roadmap 1章「1単元で試してから量産」)、UIデザインや解説方針の判断、スキーマやマイグレーションが絡むもの。
- 並列セッション: 仕様が固まっていて、触る場所が互いに重ならないもの。各セッションで「worktreeで作業して」と頼むと`.claude/worktrees/<name>`に移る。依存は`pnpm install --frozen-lockfile`を各worktreeで入れ、`.env.local`が無ければ`make env-local`で作る。開発サーバーは3000番が衝突するので2本目はポートを変える。Supabaseローカルスタックは共有なので`make db-reset`は1セッションに限る。
- 夜間ループ: 型が決まった量産(2単元目以降)と再現済みの不具合。実装側は質問できないので、Briefが曖昧なものは`agent:needs-human`で戻る。現状の関門は`issue-<n>`を名前に含むテストを必須にしている。

Issueにしないもの: 設計の検討や試行錯誤(結論だけADRかdocsに書く)、その場で数分で直せる修正(コミットメッセージで足りる)。

## 人に残る動き

朝に夜間ループのログと`agent:needs-human`を見て判断する。日中は判断が要るIssueと「最初の1件」を進め、独立なIssueを並列タブで回す。夕方に翌晩へ流すIssueのBriefを書いて`ready-for-agent`を付け、ループを起動する。

## 品質確認

品質確認はローカルで完結させる(ADR 0005)。`make setup`が有効にするgit hookで、push前にlint・型・単体テストが走る。関門(`make check`)のE2Eはmainとの差分で決めた範囲だけを回し、全件はissue-loopの終了時(`scripts/full-check.sh`)と`production`を進める前(`make publish`が同じスクリプトを呼ぶ。docs/deployment.md)に回す。GitHub Actionsはlint・型・単体テスト・ビルドの1ジョブ(約45秒)だけ。
