#!/bin/bash

TARGET_DIR="/root"

# Install prerequisites.
apt-get -y update
apt-get install -y git curl docker.io docker-compose
docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest

# Download example docker-compose.yml file.
curl -fSL -o \
  $TARGET_DIR/docker-compose.yml \
  https://raw.githubusercontent.com/alexander-danilenko/ua-loadtest/master/examples/docker-compose.yml

# Set correct REQUESTS_CONCURRENCY value depending on droplet RAM.
# Note: megabytes used because of incorrect rounding to Gb by Linux.
export MEM_MB=$(free -m | grep Mem: | awk '{print $2}')
export TARGET_CONCURRENCY=$(($MEM_MB/2))
sed -i "s/REQUESTS_CONCURRENCY.*/REQUESTS_CONCURRENCY: $TARGET_CONCURRENCY/" $TARGET_DIR/docker-compose.yml

# Start docker-compose in detached mode.
docker-compose --file $TARGET_DIR/docker-compose.yml up -d
