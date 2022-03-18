FROM node:16-alpine as build

WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock /app/
COPY --from=build /app/dist /app/dist
RUN yarn install --frozen-lockfile --production

ENTRYPOINT ["yarn", "start:prod"]
