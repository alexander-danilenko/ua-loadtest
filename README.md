<h1 align="center">Ukraine National Load-Testing</h1>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" height="69" alt="Nest Logo" hspace="10" />
  <img src="https://nestjs.com/img/logo_text.svg" height="69" alt="Nest Logo" hspace="10" />
</p>

- [Overview](#-overview)
- [Quick start](#-quick-start)
  - [Docker](#docker)
  - [Docker Compose](#docker-compose)
  - [Node.JS](#nodejs)
- [ Runtime config recommendations](#️-runtime-config-recommendations)
  - [DigitalOcean](#digitalocean)

## 😎 Overview

- The repo contains [Nest.JS](https://nestjs.com) application, which uses russian proxies and do load testing of web resources using API.
- ⚠ The app uses a proxy, but be careful, it is desirable to use a VPN.

**Wait, another one?**

Yep, here are some reasons to use this app:

- 🙌 App works fully unattended
- ☁️ Default configuration works perfectly on the cheapest $6/mo [DigitalOcean](https://m.do.co/c/231316d38894) instance:
  - 1 vCPU
  - 1 Gb RAM
- 🧠 App consumes always near the same amount of resources, no matter doing load-testing of 5 sites or 50`000
- 🔄 URLs and Proxies will be automatically updated in a runtime
- 🐋️ Designed with Docker and Clouds in mind
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
  docker run --rm -d ghcr.io/alexander-danilenko/ua-loadtest:latest
  ```

- List running containers: ([docs](https://docs.docker.com/engine/reference/commandline/ps/))
- Stop running container: ([docs](https://docs.docker.com/engine/reference/commandline/stop/))
- See logs for running container: ([docs](https://docs.docker.com/engine/reference/commandline/logs/))

See [.env](./.env) file for the available environment variables. All these values could be adjusted for the container.

For overriding _environment variables_ in the container started with `docker run` command, modify command for having variables in the following format:

```shell
docker run --rm -d -e 'NO_COLOR=1' -e 'LOG_SUMMARY_TABLE=true' ghcr.io/alexander-danilenko/ua-loadtest:latest
```

### Docker Compose

`docker-compose` allows you to easily run containers in parallel without having to keep multiple terminals opened. To run on servers - perfect choice.

```yaml
version: '3'
services:
  # To run several containers in parallel use scale argument:
  # docker-compose up --build --scale app=5
  app:
    image: ghcr.io/alexander-danilenko/ua-loadtest:latest
    restart: unless-stopped # Re-run after system reboot or docker daemon restart.
    environment:
      NO_COLOR: 'true' # Disables colored output for better logs in clouds.
      ## Defines amount of concurrent requests per second.
      #REQUESTS_CONCURRENCY: 500 # Adjust only if needed. Recommended: 500 * {RAM GB}
      # Print summary table with results.
      LOG_SUMMARY_TABLE: 'false'
      # Log response status codes to console during load testings.
      LOG_RESPONSE_SUCCESS: 'false'
      LOG_RESPONSE_TIMEOUT: 'false'
      LOG_RESPONSE_ERROR: 'false'
      # UAShield settings.
      UASHIELD_USE_PROXY: 'true'
      UASHIELD_URLS: 'https://raw.githubusercontent.com/opengs/uashieldtargets/v2/sites.json'
      UASHIELD_PROXIES: 'https://raw.githubusercontent.com/opengs/uashieldtargets/v2/proxy.json'
```

> ⚠️ **NOTE:** in `docker-compose.yml` file all the `true` and `false` values needs to be passed as lowercase strings (using quotes) like following: `VARIABLE_NAME: 'true'`


### Node.JS

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
  yarn start:production
  ```

## ⚙️ Runtime config recommendations

Run container using `docker-compose` or use `--restart unless-stopped` docker parameter. Just in case.

### DigitalOcean

> ❤️ The following scripts are tested and primarely used by maintainers.

Use the following `User data` scripts for automated initialization of droplet **considering its resources**:

- **Ubuntu/Debian** (recommended): [setup-debian.sh](./examples/digitalocean/setup-debian.sh)
- **Fedora**: [setup-fedora.sh](./examples/digitalocean/setup-fedora.sh)
