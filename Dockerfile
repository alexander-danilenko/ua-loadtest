FROM node:16-alpine

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

ENTRYPOINT ["yarn", "start:prod"]
