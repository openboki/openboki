# 公開の手順

mainに統合しただけでは公開されない。`production`ブランチを進めると、GitHub Actionsがイメージを作り、承認のあとVPSでデプロイが始まる(ADR 0006、ADR 0012)。VPSとCoolifyの初期設定は別に書く(Issue #355)。本番のSupabaseとUmamiは`deploy/README.md`。

## 公開する

```sh
make publish
```

`scripts/publish.sh`が次の順に進める。

1. `origin/main`の先頭を専用のworktreeに出し、関門をE2E全件つきで回す(`scripts/full-check.sh`、10分前後)。
2. 通ったら、そのコミットを`production`へfast-forwardでpushする。落ちたら何もpushしない。

途中のコミットまで公開するときは`make publish PUBLISH_REF=<コミット>`。mainに無いコミットと、`production`より前のコミットは断る。

pushを受けて`.github/workflows/deploy.yml`が動く。

1. `build`: Dockerイメージを作り、`ghcr.io/openboki/openboki:<コミットのSHA>`としてpushする。
2. `deploy`: Actionsの画面で承認すると、VPSにSSHで入り、そのSHAのデプロイを起動する。承認するまで本番は変わらない。

夜間ループの最後に公開まで進めるときは`QUALITY_PUBLISH=1`を付ける(`make quality-night QUALITY_UNTIL=06:00 QUALITY_PUBLISH=1`)。既定では進めない。この場合も承認は人が行う。

## 巻き戻す

`production`は戻さない(force pushは禁止)。前のコミットのイメージを指定してデプロイし直す。

```sh
gh workflow run deploy.yml --ref production -f sha=<戻したいコミットの40桁のSHA>
```

ビルドは走らず、`deploy`だけが承認待ちになる。指定できるのは、過去に`production`へpushされてGHCRにイメージがあるコミット。

巻き戻したあと、原因をmainで直して`make publish`すれば、`production`はそのまま前へ進む。直すまでの間に`make publish`を打つと、壊れた版がまた公開されるので打たない。

## GitHub側の設定

リポジトリの設定に次を置く。値を変えたら、次の公開から効く。

| 種類 | 名前 | 中身 |
|---|---|---|
| Environment | `production` | 必須レビュアーに運営者を置く。デプロイできるブランチを`production`に限る |
| Variable | `NEXT_PUBLIC_SUPABASE_URL` | `https://api.openboki.org` |
| Variable | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `deploy/anon-key.mjs`で作ったanonキー |
| Variable | `UMAMI_URL`、`UMAMI_WEBSITE_ID` | Umamiを公開するURLと、登録したサイトのID。空なら計測しない |
| Variable | `DEPLOY_HOST`、`DEPLOY_USER` | VPSのホスト名と、デプロイ用のユーザー |
| Variable | `DEPLOY_KNOWN_HOSTS` | VPSのホスト鍵(`ssh-keyscan <ホスト>`の出力を、VPSの上で見た指紋と照らしてから置く) |
| Secret | `DEPLOY_SSH_KEY` | デプロイ用の秘密鍵 |

`DEPLOY_`の5つは`production`のEnvironmentに置くと、承認の前には読めない。

デプロイ用の鍵は、VPSの`authorized_keys`で実行できるコマンドを1つに固定する。ワークフローが渡すのはコミットのSHAだけで、VPS側のコマンドがそれを検査してCoolifyのデプロイを呼ぶ。鍵が漏れても、できるのは過去にビルドした版のデプロイに限られる。

GHCRのイメージは、最初のpushのあとパッケージの設定で公開にする(VPSが認証なしでpullできる)。イメージに秘密の値は入っていない。
