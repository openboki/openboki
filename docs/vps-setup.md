# VPSを立てる手順

さくらのVPS 1台にCoolifyを入れ、Next.js、Supabase、Umamiを動かすまでの手順(ADR 0006)。日々の公開と巻き戻しは`docs/deployment.md`、composeの中身と秘密の値の作り方は`deploy/README.md`。

この手順は実機で通していない。CoolifyのAPIは4.7.6の公式ドキュメントとOpenAPIの定義から書いた。初回の公開(Issue #75)で通し、違っていた箇所をここに直す。確かめる点は末尾にまとめた。

## Web画面で行うこと

コマンドにできなかった操作は次の4つ。

1. さくらのVPSの契約と、スタートアップスクリプトの登録
2. さくらのパケットフィルターの設定
3. DNSのレコード
4. CoolifyのAPIの有効化とトークンの発行(Coolifyに、画面を使わずに行う方法が無い)

## 1. VPSを契約する

OSはUbuntu 24.04にする(Coolifyのインストーラーが対応を明記している最新のLTS)。

コントロールパネルの「スタートアップスクリプト」に`deploy/vps-startup.sh`を登録し、パラメーターに`ADMIN_SSH_PUBKEY`、`DEPLOY_SSH_PUBKEY`、`COOLIFY_EMAIL`の3つを登録する。OSのインストールでこのスクリプトを選び、値を入れる。

デプロイ用の鍵は、手元で先に作っておく。秘密鍵はGitHubのSecret `DEPLOY_SSH_KEY`に置く。

```sh
ssh-keygen -t ed25519 -N '' -C openboki-deploy -f ./deploy-key
```

スクリプトは次を行う。ログは`/root/.sakuravps/startup.log`に出る。

- unattended-upgradesを入れ、SSHを鍵だけにする。
- Coolifyを入れる。本体の自動更新は止める。管理者のパスワードは`/root/coolify-admin.txt`に書く。
- Coolifyの管理画面のポート(8000、6001、6002)を`127.0.0.1`だけで待ち受けるようにする。
- `deploy`ユーザーを作り、デプロイ用の鍵で実行できるコマンドを`/usr/local/bin/openboki-deploy`の1つに固定する。

## 2. パケットフィルターとDNS

パケットフィルターはTCPの22、80、443だけを通す。さくらのパケットフィルターはIPv4にしか効かないので、管理画面のポートはスクリプトが`127.0.0.1`に寄せている。

DNSは、`openboki.org`、`api.openboki.org`、`stats.openboki.org`のAレコードをVPSに向ける。

## 3. Coolifyに入り、APIを開ける

管理画面は外に出していないので、SSHトンネルで入る。

```sh
ssh -N -L 8000:127.0.0.1:8000 -L 6001:127.0.0.1:6001 -L 6002:127.0.0.1:6002 ubuntu@<VPS>
ssh ubuntu@<VPS> sudo cat /root/coolify-admin.txt
```

`http://localhost:8000`を開き、`COOLIFY_EMAIL`とそのパスワードでログインする。

1. パスワードを変え、`sudo rm /root/coolify-admin.txt`で消す。
2. 「Settings > Advanced > API and MCP」でAPI accessをEnabledにする。
3. 「Keys & Tokens > API Tokens」でトークンを2つ作る。設定用は`root`権限で期限7日。デプロイ用は`write`と`deploy`で期限なし。

以降はVPSの上で打つ。

```sh
C=http://127.0.0.1:8000/api/v1
T=<設定用のトークン>
api() { curl -fsS -H "Authorization: Bearer $T" -H 'Content-Type: application/json' "$@"; }
SERVER=$(api "$C/servers" | jq -r '.[0].uuid')
PROJECT=$(api -X POST "$C/projects" -d '{"name":"openboki"}' | jq -r .uuid)
```

## 4. SupabaseとUmamiを登録する

公開リポジトリの`deploy/compose.yaml`を読ませる。`is_preserve_repository_enabled`は、`kong.yml`と`roles.sql`をリポジトリから取るために要る。pushでの自動デプロイとPRのプレビューは切る。フォークからのPRを本番で動かさないためで、GitHub側にWebhookも置かない。

```sh
BACKEND=$(api -X POST "$C/applications/public" -d '{
  "project_uuid":"'$PROJECT'","server_uuid":"'$SERVER'","environment_name":"production",
  "name":"backend",
  "git_repository":"https://github.com/openboki/openboki","git_branch":"production",
  "build_pack":"dockercompose","base_directory":"/deploy","docker_compose_location":"/compose.yaml",
  "docker_compose_domains":[
    {"name":"kong","domain":"https://api.openboki.org:8000"},
    {"name":"umami","domain":"https://stats.openboki.org:3000"}],
  "is_preserve_repository_enabled":true,"is_auto_deploy_enabled":false,"is_preview_deployments_enabled":false
}' | jq -r .uuid)
```

秘密の値を作って渡す(`deploy/README.md`)。値は控えておく。

```sh
env_set() { api -X POST "$C/applications/$BACKEND/envs" -d '{"key":"'$1'","value":"'$2'","is_literal":true}' > /dev/null; }
POSTGRES_PASSWORD=$(openssl rand -hex 24); JWT_SECRET=$(openssl rand -hex 32)
env_set POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
env_set JWT_SECRET "$JWT_SECRET"
env_set UMAMI_APP_SECRET "$(openssl rand -hex 32)"
env_set API_EXTERNAL_URL https://api.openboki.org/auth/v1
env_set SITE_URL https://openboki.org
api -X POST "$C/deploy?uuid=$BACKEND"
```

起動したら、マイグレーションを当てる(`deploy/README.md`の「マイグレーションを当てる」)。続けてUmamiに`https://stats.openboki.org`から入り、初期パスワード(`admin` / `umami`)を変えて、サイトを登録する。

GitHubのVariablesに、`NEXT_PUBLIC_SUPABASE_URL`(`https://api.openboki.org`)、`NEXT_PUBLIC_SUPABASE_ANON_KEY`(`JWT_SECRET=... node deploy/anon-key.mjs`の出力)、`UMAMI_URL`(`https://stats.openboki.org`)、`UMAMI_WEBSITE_ID`を置く(`docs/deployment.md`)。

## 5. Next.jsを登録する

先に`make publish`でイメージを1つ作り、GHCRのパッケージを公開にしておく。`<SHA>`はそのコミット。ヘルスチェックはイメージの`HEALTHCHECK`を使うので、Coolify側では設定しない。

```sh
WEB=$(api -X POST "$C/applications/dockerimage" -d '{
  "project_uuid":"'$PROJECT'","server_uuid":"'$SERVER'","environment_name":"production",
  "name":"web",
  "docker_registry_image_name":"ghcr.io/openboki/openboki","docker_registry_image_tag":"<SHA>",
  "ports_exposes":"3000","domains":"https://openboki.org"
}' | jq -r .uuid)
api -X POST "$C/deploy?uuid=$WEB"
```

デプロイ用のコマンドに、トークンとアプリのUUIDを渡す。

```sh
printf 'COOLIFY_TOKEN=%s\nWEB_APP_UUID=%s\n' '<デプロイ用のトークン>' "$WEB" | sudo tee /etc/openboki/deploy.env > /dev/null
```

GitHubの`production`のEnvironmentに、`DEPLOY_HOST`、`DEPLOY_USER`(`deploy`)、`DEPLOY_KNOWN_HOSTS`、`DEPLOY_SSH_KEY`を置く。ここまでで、Actionsの`deploy`を承認すると公開まで進む。

## 6. 通知と死活監視

デプロイの失敗、サーバーに届かない、ディスクの残りが少ない、の3つを通知する。宛先はメール(SMTPかResend)かDiscordで、初回の公開で決める。Discordの例:

```sh
api -X PATCH "$C/notifications/discord" -d '{"discord_enabled":true,"discord_webhook_url":"<Webhook URL>",
  "deployment_failure_discord_notifications":true,"server_unreachable_discord_notifications":true,"server_disk_usage_discord_notifications":true}'
```

VPSごと止まるとCoolifyも通知できない。外からの監視は`.github/workflows/uptime.yml`が15分おきに`https://openboki.org`と`https://api.openboki.org/auth/v1/health`を叩き、落ちていればワークフローが失敗してGitHubから通知が来る。公開したら、リポジトリのVariableに`UPTIME_CHECK=1`を置いて有効にする。GitHubの混雑で実行が遅れることがあるので、分単位の検知は当てにしない。

## 7. 訪問者のIPアドレスとログ

Coolifyのプロキシ(Traefik)は、外から来た`X-Forwarded-For`を捨て、接続元のIPアドレスで付け直す。KongとUmamiはこの値で訪問者を見分ける(`deploy/README.md`)。VPSの手前にCDNを置くと接続元がCDNになるので、そのときは設定を見直す。

IPアドレスが残る場所は次の2つ。保存を日数で切る仕組みは足さない。

- プロキシのアクセスログは、既定で無効のままにする。保存しない。
- コンテナのログ(KongとGoTrueがリクエストごとにIPアドレスを出す)は、Dockerがコンテナごとに10MB × 3個で古いものから捨てる。インストーラーが`/etc/docker/daemon.json`に書く既定値で、期間ではなく量で決まる。

初回の公開で、次を見て確かめる。

```sh
cat /etc/docker/daemon.json
docker inspect coolify-proxy --format '{{.Args}}' | tr ' ' '\n' | grep -i accesslog || echo "アクセスログは無効"
```

## 8. 月1回の更新

```sh
# Coolify本体(アプリは止まらない)。版は https://cdn.coollabs.io/coolify/versions.json
curl -fsSL https://cdn.coollabs.io/coolify/upgrade.sh | sudo bash -s <版>
```

SupabaseとUmamiは、`deploy/compose.yaml`のイメージの版を上げてmainへ統合し、`make publish`で`production`を進めたあと、VPSで`api -X POST "$C/deploy?uuid=$BACKEND"`を打つ。Postgresを上げる前には`pg_dump`を取る。Umamiを上げるときは、識別子の作り方と保存する項目が変わっていないかを確かめる。

OSの更新はunattended-upgradesが当てる。再起動が要る更新が溜まっていないかを`ls /var/run/reboot-required`で見る。

## 初回の公開で確かめる点

- スタートアップスクリプトが最後まで通る(`startup.log`)。Coolifyのインストーラーが、スクリプトの中から対話なしで終わる。
- ポートを`127.0.0.1`に寄せたあとも、プロキシ(80、443)が動く。外から8000、6001、6002、8080に届かない(IPv6でも)。
- composeの`./kong.yml`と`./roles.sql`が、ディレクトリではなくファイルとしてマウントされる。だめなら、composeのvolumesを長い書式にして`is_directory: false`を付ける。
- composeにあるホスト側のポート(`127.0.0.1:5432`など)がCoolifyで問題にならない。
- Kongのラベルに書いた回数制限(IPアドレスあたり1分1200回)が効き、通常の利用を止めない。
- `PATCH /applications/<uuid>`で`docker_registry_image_tag`を変えてからデプロイすると、そのコミットのイメージに入れ替わる。入れ替えの間、サイトが止まらない。
- KongとUmamiに訪問者のIPアドレスが届く(GoTrueのログの`remote_addr`、Umamiの地域)。
- プロジェクトを作ると`production`の環境が付いてくる。付かなければ先に環境を作る。
