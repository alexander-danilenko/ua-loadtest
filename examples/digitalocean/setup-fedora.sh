#!/bin/bash

TARGET_DIR="/root"

# Install prerequisites.
dnf install -y curl docker docker-compose htop
# Restart docker service.
service docker restart

# Pull the image.
docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest

# Download example docker-compose.yml file.
curl -fSL -o \
  $TARGET_DIR/docker-compose.yml \
  https://raw.githubusercontent.com/alexander-danilenko/ua-loadtest/master/examples/docker-compose.yml

# Start docker-compose in detached mode.
docker-compose --file $TARGET_DIR/docker-compose.yml up -d
