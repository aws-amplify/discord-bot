FROM --platform=linux/amd64 node:16-alpine as builder
WORKDIR /usr/src
# install curl
RUN apk --no-cache add curl
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

# final bot image
FROM --platform=linux/amd64 node:16-alpine
WORKDIR /usr/src
RUN apk --no-cache add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

# expose necessary env vars
ENV DISCORD_BOT_TOKEN=""

COPY --from=builder /root/.pnpm-store /root/.pnpm-store
COPY --from=builder /usr/src .

WORKDIR /usr/src/apps/bot

EXPOSE 3000
CMD ["pnpm", "start"]
