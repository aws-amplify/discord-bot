FROM node:16
WORKDIR /usr/src/app
# install pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
# expose necessary env var
ENV DISCORD_BOT_TOKEN=""
# copy pnpm files for dependencies
COPY ../.npmrc package.json ../pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY build .
EXPOSE 3000
CMD [ "node", "app.js" ]