#syntax=docker/dockerfile:1.4
FROM --platform=linux/amd64 node:16-alpine as base
WORKDIR /usr/src
RUN npm install --global pnpm@7.2.0
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
RUN pnpm fetch
# add project source to build
ADD . .
# install dependencies
RUN pnpm install --offline --frozen-lockfile
# expose arguments for VITE environment variables
ARG VITE_HOST=http://localhost:3000
ARG VITE_NEXTAUTH_URL=http://localhost:3000
ARG VITE_DISCORD_GUILD_ID=935912872352051313
ARG DATABASE_URL="file:/data/sqlite.db"
# expose necessary env vars
ENV PORT=3000
# run build
RUN pnpm run build:lib && pnpm run build
# install production dependencies
RUN pnpm install --offline --frozen-lockfile --prod --ignore-scripts

EXPOSE 3000
CMD ["./scripts/start.sh"]
