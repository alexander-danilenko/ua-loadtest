<h1 align="center">🇺🇦 Ukraine national load-testing</h1>

## 😎 Overview

- The repo contains [Nest.JS](https://nestjs.com) application, which uses russian proxies and do load testing of web resources using API.
- ⚠ The app uses a proxy, but be careful, it is desirable to use a VPN.

## 🚀 Quick start

[//]: # (### Docker)

[//]: # ()
[//]: # (- Install [Docker]&#40;https://docker.com&#41;)

[//]: # ()
[//]: # (- Download docker image:)

[//]: # ()
[//]: # (  ```shell)

[//]: # (  docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest)

[//]: # (  ```)

[//]: # ()
[//]: # (- Launch the container for the 500 threads:)

[//]: # ()
[//]: # (  ```shell)

[//]: # (  docker run --rm ghcr.io/alexander-danilenko/ua-loadtest:latest)

[//]: # (  ```)

#### Docker environment variables

See [.env](./.env) file. All these values could be used for the app in a docker container.

### Docker Compose

`docker-compose` allows you to easily run containers in parallel without having to keep multiple terminals opened. To run on servers - perfect choice.

- Clone repository:
  ```shell
  git clone https://github.com/alexander-danilenko/ua-loadtest
  ```

- Build and run:

  ```shell
  docker-compose up --build -d
  ```

- See recent logs:

  ```shell
  docker-compose logs
  ```

- Stop containers:

  ```shell
  docker-compose down
  ```

[//]: # (### Linux and MacOS)

[//]: # ()
[//]: # (- Install Node `v16`: https://nodejs.org/en/download/)

[//]: # ()
[//]: # (- Clone repository:)

[//]: # (  ```shell)

[//]: # (  git clone https://github.com/alexander-danilenko/ua-loadtest)

[//]: # (  ```)

[//]: # ()
[//]: # (- Install all the required dependencies:)

[//]: # (  ```shell)

[//]: # (  yarn install)

[//]: # (  ```)

[//]: # (  )
[//]: # (- Build the app:)

[//]: # (  ```shell)

[//]: # (  yarn build)

[//]: # (  ```)

[//]: # ()
[//]: # (- Run the app in production mode:)

[//]: # (  ```shell)

[//]: # (  yarn start:prod)

[//]: # (  ```)
