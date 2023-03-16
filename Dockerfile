#syntax=docker/dockerfile:1.4
# FROM --platform=linux/amd64 node:18-alpine as pnpm-builder
ARG NODE_VERSION="18.14.2"
ARG ALPINE_VERSION="3.17"
ARG PNPM_VERSION="7.25.0"
ARG PLATFORM="linux/amd64"
FROM --platform=${PLATFORM} node:${NODE_VERSION}-alpine${ALPINE_VERSION} as pnpm-builder
# RUN apk add --no-cache libc6-compat
# RUN apk update
WORKDIR /workspace
# Install pnpm
RUN npm install --global pnpm@${PNPM_VERSION}
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
COPY patches ./patches
# mount pnpm store as cache & install dependencies
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm-store \
  pnpm fetch

FROM pnpm-builder AS workspace
WORKDIR /workspace
ENV CI=true
# add project source to build
COPY . ./
# install dependencies
RUN pnpm install --frozen-lockfile --offline
# expose arguments for VITE environment variables
ARG VITE_HOST=http://localhost:3000
ARG VITE_NEXTAUTH_URL=http://localhost:3000
ARG VITE_DISCORD_GUILD_ID=976838371383083068
# run build
RUN pnpm run build
# deploy app
RUN pnpm deploy --filter @aws-amplify/discord-bot-frontend ./dist/bot.amplify.aws
# deploy bot
RUN pnpm deploy --filter @aws-amplify/discord-bot ./dist/discord-bot