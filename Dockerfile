# 本番用のNext.jsイメージ(ADR 0006)。standaloneの成果物だけを実行用のステージに入れる。
# ビルド時に焼き込まれる値はbuild-argで渡す。ビルドには.gitが入らないので、CONTENT_VERSIONを渡さないと
# 回答ログの版が「uncommitted」になる(next.config.ts)。例:
#   docker build --build-arg CONTENT_VERSION=$(git rev-parse --short HEAD) \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=https://api.openboki.org \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... -t openboki .
# `make docker-build`はCONTENT_VERSIONをgitから取り、Supabaseの値を環境変数から渡す。

FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG CONTENT_VERSION
ARG SITE_URL=https://openboki.org
ARG UMAMI_URL
ARG UMAMI_WEBSITE_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# 無停止の入れ替えに使う。イメージにcurlもwgetも無いのでnodeで叩く
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "server.js"]
