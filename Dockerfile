#syntax=docker/dockerfile:1.4
FROM --platform=linux/amd64 node:16-alpine as base
WORKDIR /usr/src
RUN npm install --global pnpm@7.1.0
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
RUN pnpm fetch
# add project source to build
ADD . .
# install dependencies
RUN pnpm install --offline --frozen-lockfile
# run build
RUN pnpm run build:lib && pnpm run build
# remove dev dependencies (ignore scripts like "prepare")
RUN pnpm install --offline --frozen-lockfile --prod --ignore-scripts

# final bot image
FROM --platform=linux/amd64 node:16-alpine
WORKDIR /usr/src
RUN npm install --global pnpm@7.1.0

# expose necessary env vars
ENV DISCORD_BOT_TOKEN=""
ENV PORT 3000
ENV DATABASE_URL="file:../db/data.db"

COPY --from=base /usr/src .
# RUN npx prisma migrate deploy

EXPOSE 3000
CMD ["./scripts/start.sh"]
