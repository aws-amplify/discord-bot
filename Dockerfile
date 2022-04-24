FROM --platform=linux/amd64 node:16 as builder
WORKDIR /usr/src
# install pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
# RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
RUN pnpm fetch
# add project source to build
ADD . .
# install dependencies
RUN pnpm install --offline
# run build
RUN pnpm run --filter ./packages --filter ./apps build
# remove dev dependencies
RUN pnpm install --offline --prod
