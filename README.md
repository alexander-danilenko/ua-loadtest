<h1 align="center">Ukraine National Load-Testing</h1>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" height="69" alt="Nest Logo" hspace="10" />
  <img src="https://nestjs.com/img/logo_text.svg" height="69" alt="Nest Logo" hspace="10" />
</p>

## 😎 Overview

- The repo contains [Nest.JS](https://nestjs.com) application, which uses russian proxies and do load testing of web resources using API.
- ⚠ The app uses a proxy, but be careful, it is desirable to use a VPN.

### Wait, another one?

Yep, here are some reasons to use this app:

- 🙌 App works fully unattended
- ☁️ Default configuration works perfectly on the cheapest $6/mo [DigitalOcean](https://m.do.co/c/231316d38894) instance:
  - 1 vCPU
  - 1 Gb RAM
- 🧠 App consumes always near the same amount of resources, no matter doing load-testing of 5 sites or 50`000
- 🔄 URLs and Proxies will be automatically updated in a runtime
- 😶‍🌫️ Designed with Docker and Clouds in mind
- 💢️ Coded with pure anger
- 🍁 Eco-friendly
- 🥦 Gluten-free

## 🚀 Quick start

### Docker

- Install [Docker](https://docker.com)

- Download docker image:

  ```shell
  docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest
  ```

- Run the container: ([docs](https://docs.docker.com/engine/reference/commandline/run/))

  ```shell
  docker run --rm ghcr.io/alexander-danilenko/ua-loadtest:latest
  ```
  
- List running containers: ([docs](https://docs.docker.com/engine/reference/commandline/ps/))
- Stop running container: ([docs](https://docs.docker.com/engine/reference/commandline/stop/))
- See logs for running container: ([docs](https://docs.docker.com/engine/reference/commandline/logs/))

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
      # Defines amount of concurrent requests per second.
      REQUESTS_CONCURRENCY: 250
      # Print summary table with results.
      LOG_SUMMARY_TABLE: 'true'
      # Log response status codes to console during load testings.
      LOG_RESPONSE_SUCCESS: 'false'
      LOG_RESPONSE_TIMEOUT: 'false'
      LOG_RESPONSE_ERROR: 'false'
      # API endpoints definitions.
      UASHIELD_REQUEST_TIMEOUT: 30000
      UASHIELD_URLS: 'https://raw.githubusercontent.com/opengs/uashieldtargets/v2/sites.json'
      UASHIELD_PROXIES: 'https://raw.githubusercontent.com/opengs/uashieldtargets/v2/proxy.json'
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
