# 本番のSupabaseとUmami

`compose.yaml`が、SupabaseのPostgres、GoTrue、PostgREST、Kongの4サービス(ADR 0006)と、アクセス解析のUmami(ADR 0011)を定義する。Coolifyにはこのファイルを読ませる。VPSとCoolifyの設定は`docs/vps-setup.md`。

ブラウザはKongだけに届く。Kongは`/auth/v1`をGoTrueへ、`/rest/v1`をPostgRESTへ渡す。Postgresは`127.0.0.1`でだけ待ち受ける。

## 秘密の値を作る

`.env.example`を`.env`に写し、3つの値を埋める。`.env`はコミットしない。

```sh
cp deploy/.env.example deploy/.env
openssl rand -hex 24   # POSTGRES_PASSWORD
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # UMAMI_APP_SECRET
```

anonキーは`JWT_SECRET`で署名したJWTで、Next.jsのビルドに`NEXT_PUBLIC_SUPABASE_ANON_KEY`として渡す。ブラウザに配られる値なので秘密ではない。`JWT_SECRET`を変えたら作り直してビルドし直す。

```sh
JWT_SECRET=... node deploy/anon-key.mjs
```

service_roleキーは作らない。匿名ユーザーの定期削除はpg_cronがDBの中で行うので、RLSを越えるキーを使う場面が無い。

## 起動する

```sh
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d
```

Postgresのロールにパスワードを付け、Umamiのデータベースを作る`roles.sql`は、データのボリュームが空の初回にだけ走る。あとから`POSTGRES_PASSWORD`を変えても反映されないので、変えるときは`alter user`を手で打つ。

## マイグレーションを当てる

自動デプロイには含めない(ADR 0006)。VPSの外からはSSHトンネルでPostgresのポートを手元に引き、`pg_dump`を取ってから当てる。TLSを置いていないので`sslmode=disable`が要る。

```sh
ssh -N -L 5432:127.0.0.1:5432 <VPS>
pg_dump "postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:5432/postgres?sslmode=disable" > backup.sql
pnpm supabase db push --db-url "postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:5432/postgres?sslmode=disable"
```

テーブルや列を変えたあとは、PostgRESTにスキーマを読み直させる。

```sh
docker compose -f deploy/compose.yaml --env-file deploy/.env kill -s SIGUSR1 rest
```

## Umami

データは同じPostgresの`umami`データベースに置く。テーブルはUmamiが起動時に作る。

初回は`admin` / `umami`でログインできるので、最初にパスワードを変える。続けて「Websites」でサイトを登録し、表示されるWebsite IDを控える。Next.jsのビルドに`UMAMI_URL`(Umamiを公開するURL)と`UMAMI_WEBSITE_ID`を渡すと、全ページが`<UMAMI_URL>/script.js`を読み込む。どちらかが無いビルドは何も読み込まない。

取るのはページビューだけにしている。記録されるのは、閲覧したページ、参照元、ブラウザとOSの種類、画面サイズ、言語、IPアドレスから推定した国・都道府県・市区町村。Cookieは置かず、IPアドレスは保存しない。ヘッドレスブラウザやクローラーは記録されないので、E2EやMonkeyの閲覧は数に入らない。

## 訪問者のIPアドレス

Umamiは`X-Forwarded-For`から訪問者のIPアドレスを取り、地域の推定と訪問者の識別子に使う。手前のプロキシがこのヘッダーを渡さないと、全員がプロキシの所在地になる。

匿名サインインは、1時間にIPアドレスあたり1000回までに制限している。学校や会社のように1つのIPアドレスを共有する場所で止めないよう、開発用(30回)より緩くした。GoTrueはKongが付ける`X-Real-IP`で数える。Kongは、Dockerの内部アドレスから来たリクエストに限って`X-Forwarded-For`を信じる。手前のプロキシ(CoolifyのTraefik)が、外から来た`X-Forwarded-For`を捨てて自分で付け直すことが前提になる。Kongのポートを外へ直接開けると、ヘッダーを偽って制限を抜けられる。

## ローカルで確かめる

開発用のSupabase(`make db-start`、54321〜)とぶつからないポートにする。`.env`を次のように変えて起動する。

```
API_EXTERNAL_URL=http://127.0.0.1:55321/auth/v1
SITE_URL=http://127.0.0.1:3200
POSTGRES_PORT=55322
KONG_PORT=55321
UMAMI_PORT=55323
```

```sh
# マイグレーションと定期削除のジョブ
pnpm supabase db push --db-url "postgresql://postgres:<POSTGRES_PASSWORD>@127.0.0.1:55322/postgres?sslmode=disable"
docker compose -f deploy/compose.yaml --env-file deploy/.env exec db psql -U postgres -c "select jobname, schedule from cron.job"

# Next.jsのイメージをこのSupabaseに向けて作り、3200番で動かす
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321 NEXT_PUBLIC_SUPABASE_ANON_KEY=<anonキー> \
  make docker-build DOCKER_IMAGE=openboki:local SITE_URL=http://127.0.0.1:3200
docker run --rm -d --name openboki-local -p 3200:3000 openboki:local
E2E_PORT=3200 pnpm exec playwright test e2e/learning-loop.spec.ts

# Umamiも確かめるときは、http://127.0.0.1:55323 でサイトを登録し、ビルドに次を足す。ブラウザでページを開くと閲覧が出る
#   UMAMI_URL=http://127.0.0.1:55323 UMAMI_WEBSITE_ID=<Website ID>

# 片付け(-vでデータも消す)
docker rm -f openboki-local
docker compose -f deploy/compose.yaml --env-file deploy/.env down -v
```

## イメージの版

Supabaseの4つのイメージは、Supabase CLI(`supabase start`)がローカルで使う版にそろえている。CLIを上げたら`docker ps`で版を見て、`compose.yaml`を同じ版に直す。Umamiは版を固定している。上げるときは、識別子の作り方と保存する項目が変わっていないかを確かめる(プライバシーポリシーの文言がこれに依存する)。
