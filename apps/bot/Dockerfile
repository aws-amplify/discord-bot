FROM node:16-alpine
WORKDIR /usr/src
RUN npm i -g pnpm

# expose necessary env vars
ENV DISCORD_BOT_TOKEN=""

COPY --from=builder /root/.pnpm-store /root/.pnpm-store
COPY --from=builder /usr/src .

WORKDIR /usr/src/apps/bot

EXPOSE 3000
CMD [ "pnpm", "start"]
