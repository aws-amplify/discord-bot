#syntax=docker/dockerfile:1.4
ARG NODE_VERSION="18.15.0"
ARG ALPINE_VERSION="3.17"
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine${ALPINE_VERSION} as base
ENV CI=true
# for turbo - https://turbo.build/repo/docs/handbook/deploying-with-docker#example
RUN apk add --no-cache libc6-compat curl
# @todo - remove this after upgrading prisma to ~4.8.0
# https://github.com/prisma/prisma/issues/16553#issuecomment-1353302617
RUN apk add --no-cache openssl1.1-compat
RUN apk update

WORKDIR /workspace
# enable corepack for pnpm
RUN corepack enable

FROM base as fetcher
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
# mount pnpm store as cache & fetch dependencies
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm-store \
  pnpm fetch --ignore-scripts

FROM fetcher as builder
ARG APP_NAME="@aws-amplify/discord-bot-frontend"
ENV APP_NAME=${APP_NAME}
# expose arguments for VITE environment variables
ARG VITE_HOST=http://localhost:3000
ARG VITE_NEXTAUTH_URL=http://localhost:3000
ARG VITE_DISCORD_GUILD_ID=976838371383083068
WORKDIR /workspace
COPY . .
RUN --mount=type=secret,id=env,required=false,target=/workspace/.env \
  pnpm install --frozen-lockfile --offline --loglevel=error
# build workspace
RUN --mount=type=secret,id=env,required=false,target=/workspace/.env \
  --mount=type=cache,target=/workspace/node_modules/.cache \
  pnpm run build

FROM builder as deployer
WORKDIR /workspace
# deploy app
RUN pnpm --filter ${APP_NAME} deploy --prod --ignore-scripts ./out

FROM base as runner
WORKDIR /workspace
# Don't run production as root
RUN addgroup --system --gid 1001 amplifygroup
RUN adduser --system --uid 1001 amplifyuser
USER amplifyuser
# copy files needed to run the app
COPY --chown=amplifyuser:amplifygroup --from=deployer /workspace/out/package.json .
COPY --chown=amplifyuser:amplifygroup --from=deployer /workspace/out/scripts/start.sh ./scripts/start.sh
COPY --chown=amplifyuser:amplifygroup --from=deployer /workspace/out/prisma ./prisma
COPY --chown=amplifyuser:amplifygroup --from=deployer /workspace/out/node_modules/ ./node_modules
COPY --chown=amplifyuser:amplifygroup --from=deployer /workspace/out/build/ ./build
# start the app
CMD pnpm run start
