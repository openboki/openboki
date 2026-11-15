# 0006. ホスティングはVPS 1台(さくらのVPS 4GB + Coolify)にNext.jsとSupabaseを同居させる

日付: 2026-11-07
状態: 採用(ユーザー決定2026-11-07。2026-11-15改定: 公開は`production`ブランチで行い、Coolifyの管理画面を外に出さない。リージョンは東京に限定しない。ビルドをGitHub Actionsで行う点は変えない)

## 背景
ADR 0003ではホスティングを未決とし、`output: 'standalone'`でホスト中立を保ってきた。候補はVercel(Hobbyは非商用のみ、Proは月20ドル)、Cloudflare(OpenNext経由で制約あり)、VPS。
SupabaseクラウドはFreeだと1週間アクセスがないと停止し、Proは月25ドルかかる。本サービスのSupabase利用はAuthと2テーブルだけで、全部入りのセルフホストは要らない。
固定費を抑え、商用化の制約を持たず、設定をCLIで再現できることを重視した。

2026-11-15の改定の背景: 実装の前に、ビルドの場所、Coolifyの要否、公開の起点を見直した。分かったことは次のとおり。
- リポジトリがpublicになり(ADR 0007)、GitHub ActionsとGHCRの公開イメージは無料で使える。
- 品質改善ループはIssueを1件直すたびにmainへpushする(11月7日〜15日の実績で1日10〜114回)。mainを公開の起点にすると、その回数だけビルドとデプロイが走る。
- `pnpm build`は上限2.0GBで強制終了し、2.5GBで通った(4コア、スワップなし、2026-11-15計測)。VPS上でビルドすると常駐分と合わせて4GBを超える見込みで、8GBプランかスワップ頼みになる。
- Coolifyは2026年に入っても重大な脆弱性の公表が続いている。GitHubからのwebhookで自動デプロイするには、Coolifyをインターネットから届く場所に置く必要がある。

## 決定
- **さくらのVPS 4GB 1台**に以下を同居させる。リージョンは国内で、契約時に最も安いところを選ぶ(東京に限定しない)。メモリ不足でコンテナが止まることがあれば8GBへ上げる(さくらのVPSは上位プランへ変更できる。下位へは戻せない)。
- **Coolify** をPaaS層にする。TLS(Let's Encrypt)、ヘルスチェック付きの無停止デプロイ、通知、サービスの管理を任せる。設定は公式CLI(`coolify`)とREST APIで行い、Web画面での手作業を残さない。
- **Coolifyの管理画面とAPIは外に公開しない。** パケットフィルタは22 / 80 / 443だけを開け、管理画面にはSSHトンネルで入る。Coolify本体は月1回を目安に更新する。
- **Next.js** はGitHub ActionsでDockerイメージをビルドしてGHCRにpushし、Coolifyはそれをpullして起動するだけにする(VPS上でビルドしない)。`output: 'standalone'`は維持する。`CONTENT_VERSION`はActionsの`github.sha`をbuild-argで渡す。Supabaseの接続先もビルド時に焼き込まれるので、同じくbuild-argで渡す。
- **公開は`production`ブランチで行う。** ビルドとデプロイのワークフローは`production`へのpushだけで動く。mainは今までどおり品質改善ループと手作業の統合先にし、公開するときに`production`をmainの位置までfast-forwardで進める。進めるのは`make check`(E2E込み)が通ったコミットだけで、夜間ループの最後か、手で打つMakefileのコマンドから行う。戻すときは、前のコミットのイメージを指定してデプロイし直す。
- **デプロイの起動はSSHで行う。** ワークフローはイメージをpushしたあと、VPSにSSHで入り、Coolifyのデプロイ用APIをVPSの中から呼ぶ。GitHubに置く鍵は、そのコマンドだけを実行できるよう制限する。
- **Supabase** はセルフホストをPostgres、GoTrue(Auth)、PostgREST、Kongの4サービスに削って動かす。Realtime、Storage、Studio、ログ分析、Edge Functionsは入れない(architecture.md 3章の方針通り)。構成はリポジトリ内のcompose 1本に書き、Coolifyにはそれを読ませる(Coolifyの画面に構成を持たせない)。匿名サインインはGoTrueの`GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=true`で有効化する。
- **マイグレーションは自動デプロイに含めない。** 手で`pg_dump`を取ってから`supabase db push --db-url`で適用する。
- **ドメイン**: `openboki.org`をNext.js、`api.openboki.org`をKongに向ける。
- **アクセス解析のUmamiも同じVPSに置く**(ADR 0011)。
- **VPSの契約とDNSの設定だけWeb画面**で行う(usacloudはさくらのクラウド専用でVPSには使えない)。初期設定(SSH鍵、パケットフィルタ、unattended-upgrades、Coolify導入)はスタートアップスクリプトで流す。
- **フォークからのPRではプレビューを作らない。** 公開リポジトリなので、他人のコードを本番のVPSで動かさない。M4のプレビューは、リポジトリのメンバーが出したPRに限り、作り方はM4で決める。
- **外部へのバックアップは置かない。** DBの中身は匿名ユーザーの進捗と回答ログだけで、消えても β のやり直しで済む。本登録(フェーズ7)を始める前に再検討する。

## 検討した代替
- Vercel Hobby + SupabaseクラウドFree: 最も手軽だが、Hobbyは非商用限定、Supabase Freeは停止する。有料化すると月45ドル超になる。
- Cloudflare(OpenNext): 無料枠は広いが、Next.js 16をOpenNext経由で動かす制約を β 前に踏む価値がない。全ページが静的生成の現状なら`output: 'export'`で載るが、Supabase側の費用の問題は残る。
- Hetzner: 2026年の値上げと安価プランの新規制限、最寄りがシンガポールで日本まで遠い。
- Dokploy: Coolifyと同等だがDocker Swarm前提で、1台構成では利点がなく、情報量も少ない。
- 2GBプラン: Coolifyを外しても常駐分が1.5〜2GBの見込みで、余裕がない。
- CoolifyがVPS上でビルドする: ワークフロー、レジストリ、デプロイ用の鍵が要らず、PRプレビューも自動で動く。代わりにビルドの2.0〜2.5GBが常駐分に乗って4GBを超え、ビルド中は本番と資源を取り合う。pushを受けて動くには、Coolifyを外から届く場所に置くことにもなる。Actionsが無料で使える間は採らない。
- CoolifyのデプロイAPIを外に出し、ワークフローからHTTPで呼ぶ: Coolifyの文書にある標準の方法で、SSHの鍵が要らない。管理画面のログインも同じ場所で外に出るので採らない。
- Coolifyを使わずDocker Compose + Caddy: 常駐が軽く、構成がすべてリポジトリに残り、Coolifyの脆弱性対応も要らない。代わりに無停止の入れ替え、通知、サービスの管理を自作することになる。Supabaseのcomposeをリポジトリに置くので、Coolifyが重荷になったときはこの形へ移れる。
- Kamal: 1アプリの無停止入れ替えには向くが、Supabaseの4サービスを付属物として持たせる形が合わない。

## 影響
- 設計原則「ホスティング中立」はDockerで動くことに読み替える。ISRや特定ホストのAPIには引き続き依存しない。
- 追加する成果物: `Dockerfile`、`production`へのpushでイメージをGHCRにpushしデプロイを起動するGitHub Actions、Supabaseのcompose、`production`を進めるMakefileのコマンド、VPSのスタートアップスクリプト、Coolifyの設定手順(docs)。CIのジョブ(ADR 0005)は変えない。
- 公開される版はmainより遅れる。mainに入った修正は、`production`を進めるまで学習者に届かない。
- GitHubが止まっている間は新しい版を公開できない。動いているサイトには影響しない。
- Supabaseイメージの更新は自分で追う。β 中は月1回を目安にする。Coolify本体の更新も同じ頻度で行う。
- メール認証(フェーズ7)を足す時はSMTPが別途要る。
- 単一障害点になる。VPSが止まると学習も回答保存も止まるので、Coolifyの通知(メール等)を最初に設定する。VPSごと止まった場合はCoolifyも通知できないので、外部からの死活監視を1つ置く。
- `docs/architecture.md` 7章と`docs/roadmap.md`の記述(「東京」「CoolifyのPRデプロイ」)をこの改定に合わせる。
