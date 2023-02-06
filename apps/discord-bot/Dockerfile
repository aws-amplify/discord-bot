#syntax=docker/dockerfile:1.4
FROM --platform=linux/amd64 alpine as builder
# Download the static build of Litestream directly into the path & make it executable.
# This is done in the builder and copied as the chmod doubles the size.
ADD https://github.com/benbjohnson/litestream/releases/download/v0.3.8/litestream-v0.3.8-linux-amd64-static.tar.gz /tmp/litestream.tar.gz
RUN tar -C /usr/local/bin -xzf /tmp/litestream.tar.gz

FROM --platform=linux/amd64 node:18-alpine
WORKDIR /usr/src

# Copy executable & Litestream from builder.
COPY --from=builder /usr/local/bin/litestream /usr/local/bin/litestream
# Copy litestream config
COPY scripts/litestream.yml /etc/litestream.yml

# add bash
RUN apk add bash

# Create data directory (although this will likely be mounted too)
RUN mkdir -p /data

# Install pnpm
ARG PNPM_VERSION=7.9.5
RUN npm install --global pnpm@${PNPM_VERSION}
# pnpm fetch only requires lockfile, but we'll need to build workspaces
COPY pnpm*.yaml ./
# RUN pnpm fetch
# add project source to build
ADD . .
# install dependencies
RUN pnpm install --frozen-lockfile
# expose arguments for VITE environment variables
ARG VITE_HOST=http://localhost:3000
ARG VITE_NEXTAUTH_URL=http://localhost:3000
ARG VITE_DISCORD_GUILD_ID=976838371383083068
ARG DATABASE_URL="file:/data/sqlite.db"
# expose necessary env vars
ENV PORT=3000
# run build
RUN pnpm run build:lib && pnpm run build
# install production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

EXPOSE 3000
CMD ["./scripts/start.sh"]
