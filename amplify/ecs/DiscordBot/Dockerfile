FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:lts-jod

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm i
RUN npm run build

EXPOSE 3000

CMD ["node","./dist/index.js"]