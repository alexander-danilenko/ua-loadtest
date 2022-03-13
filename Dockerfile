FROM node:16-alpine

WORKDIR /app

# Install dependencies.
COPY package.json yarn.lock /app/
# Use lockfile for being sure everything is compatible.
RUN yarn install --frozen-lockfile
# Copy project code.
COPY . .
# Build an app.
RUN yarn build

ENTRYPOINT ["yarn", "start:prod"]
