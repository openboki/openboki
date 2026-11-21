#!/bin/bash
# さくらのVPS(Ubuntu 24.04)のスタートアップスクリプト。初回起動で1回だけ走る(手順はdocs/vps-setup.md)。
# コントロールパネルに登録するとき、次の3つを「パラメーター」に登録する。秘密の値は渡さない(スクリプトとログがVPSに残るため)。
#   @@@ADMIN_SSH_PUBKEY@@@   運営者のSSH公開鍵
#   @@@DEPLOY_SSH_PUBKEY@@@  GitHub Actionsが使うデプロイ用の公開鍵
#   @@@COOLIFY_EMAIL@@@      Coolifyの管理者のメールアドレス(メールを受け取れるドメインのもの。Coolifyが作成時にDNSを確かめ、通らないと管理者を作らない)
set -eux

# 更新の自動適用
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y unattended-upgrades curl jq
dpkg-reconfigure -f noninteractive unattended-upgrades

# SSHは鍵だけにする。rootも鍵でなら入れるままにする(Coolifyがコンテナの中からホストへrootでSSHする)
install -d -m 700 -o ubuntu -g ubuntu /home/ubuntu/.ssh
echo '@@@ADMIN_SSH_PUBKEY@@@' >> /home/ubuntu/.ssh/authorized_keys
chown ubuntu:ubuntu /home/ubuntu/.ssh/authorized_keys && chmod 600 /home/ubuntu/.ssh/authorized_keys
cat > /etc/ssh/sshd_config.d/10-openboki.conf <<'CONF'
PasswordAuthentication no
PermitRootLogin prohibit-password
CONF
systemctl reload ssh

# Coolify。管理者のパスワードはここで作り、rootだけが読めるファイルに置く(初回ログインのあと消す)
set +x  # パスワードをログに残さない
COOLIFY_PASSWORD="$(openssl rand -base64 24)Aa1!"
install -m 600 /dev/null /root/coolify-admin.txt
echo "$COOLIFY_PASSWORD" > /root/coolify-admin.txt
env ROOT_USERNAME=admin ROOT_USER_EMAIL='@@@COOLIFY_EMAIL@@@' ROOT_USER_PASSWORD="$COOLIFY_PASSWORD" AUTOUPDATE=false \
  bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
unset COOLIFY_PASSWORD
set -x

# 管理画面のポートを127.0.0.1だけで待ち受ける。Dockerが開けるポートはOSのファイアウォールを素通りし、
# さくらのパケットフィルターはIPv6を止めないので、ここで閉じる
cat > /data/coolify/source/docker-compose.custom.yml <<'YAML'
services:
  coolify:
    ports: !override
      - "127.0.0.1:${APP_PORT:-8000}:8080"
      - "127.0.0.1:${SOKETI_PORT:-6001}:6001"
      - "127.0.0.1:6002:6002"
YAML
(cd /data/coolify/source && docker compose --env-file .env -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.custom.yml up -d)

# デプロイ用のユーザー。鍵で実行できるのは下のコマンド1つだけで、渡せるのはコミットのSHAだけ
useradd --create-home --shell /bin/bash deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo 'restrict,command="/usr/local/bin/openboki-deploy" @@@DEPLOY_SSH_PUBKEY@@@' > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys && chmod 600 /home/deploy/.ssh/authorized_keys
# CoolifyのAPIトークンとNext.jsアプリのUUIDは、アプリを登録したあとに書く(docs/vps-setup.md)。
# トークンは「|」を含むので、値は引用符で囲む
install -d -m 750 -o root -g deploy /etc/openboki
install -m 640 -o root -g deploy /dev/null /etc/openboki/deploy.env

cat > /usr/local/bin/openboki-deploy <<'SCRIPT'
#!/bin/bash
# GitHub ActionsからSSHで呼ばれ、指定されたコミットのイメージでNext.jsをデプロイし直す。
# CoolifyのAPIはイメージのタグをデプロイの引数で受けないので、アプリの設定を書き換えてからデプロイを呼ぶ
set -eu
. /etc/openboki/deploy.env
sha="${SSH_ORIGINAL_COMMAND:-}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "コミットのSHAを40桁で渡してください"; exit 1; }
api=http://127.0.0.1:8000/api/v1
curl -fsS -X PATCH "$api/applications/$WEB_APP_UUID" -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H 'Content-Type: application/json' -d "{\"docker_registry_image_tag\":\"$sha\"}" > /dev/null
curl -fsS -X POST "$api/deploy?uuid=$WEB_APP_UUID" -H "Authorization: Bearer $COOLIFY_TOKEN"
echo
SCRIPT
chmod 755 /usr/local/bin/openboki-deploy
