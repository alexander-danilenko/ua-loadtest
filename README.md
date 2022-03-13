<h1 align="center">Ukraine National Load-Testing</h1>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" height="42" alt="Nest Logo" hspace="10" />
  <img src="https://nestjs.com/img/logo_text.svg" height="42" alt="Nest Logo" hspace="10" />
</p>

## 😎 Overview

- The repo contains [Nest.JS](https://nestjs.com) application, which uses russian proxies and do load testing of web resources using API.
- ⚠ The app uses a proxy, but be careful, it is desirable to use a VPN.

## 🚀 Quick start

### Docker

- Install [Docker](https://docker.com)

- Download docker image:

  ```shell
  docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest
  ```

- Launch the container:

  ```shell
  docker run --rm ghcr.io/alexander-danilenko/ua-loadtest:latest
  ```
  
#### Docker environment variables

See [.env](./.env) file. All these values could be used for the app in a docker container.

### Docker Compose example

`docker-compose` allows you to easily run containers in parallel without having to keep multiple terminals opened. To run on servers - perfect choice.

```yaml
version: '3'
services:
  # To run several containers in parallel use scale argument:
  # docker-compose up --build --scale app=5
  app:
    image: ghcr.io/alexander-danilenko/ua-loadtest:latest
    environment:
      # Defines request timeout for the target sites.
      TIMEOUT: 10000 # 10 seconds.
      # Defines amount of concurrent requests per batch.
      REQUESTS_CONCURRENCY: 500
      # Print summary table with results.
      LOG_SUMMARY_TABLE: 'true'
      # Log response status codes to console during load testing.
      LOG_RESPONSE_SUCCESS: 'false'
      LOG_RESPONSE_TIMEOUT: 'false'
      LOG_RESPONSE_ERROR: 'false'
      # API endpoints definitions.
      API_ENDPOINT_HOSTS: 'https://hutin-puy.nadom.app/hosts.json'
      API_ENDPOINT_PROXIES: 'https://hutin-puy.nadom.app/proxy.json'
```

### Linux and MacOS

- Install Node `v16`: https://nodejs.org/en/download/

- Clone repository:

  ```shell
  git clone https://github.com/alexander-danilenko/ua-loadtest
  ```


- Install all the required dependencies:
  ```shell
  yarn install
  ```

  
- Build the app:

  ```shell
  yarn build
  ```


- Run the app in production mode:
  ```shell
  yarn start:prod
  ```
