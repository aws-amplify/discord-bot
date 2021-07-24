FROM node:16-alpine

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /usr/app
# copy package files for deps
COPY package.json .
COPY packages/app/package.json ./packages/app/
COPY yarn.lock .
# install deps for building
RUN yarn install --frozen-lockfile
COPY src ./src
COPY packages/app/svelte.config.js ./packages/app/
COPY packages/app/src ./packages/app/
COPY packages/app/public ./packages/app/
RUN yarn build
# install prod deps, removes dev deps
RUN yarn install --frozen-lockfile --production
CMD yarn start