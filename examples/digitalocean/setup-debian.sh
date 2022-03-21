#!/bin/bash

TARGET_DIR="/root"

# Create swap.
SWAP_SIZE='8G' && \
SWAP_FILE='/swapfile' && \
swapoff -a && \
fallocate -l ${SWAP_SIZE} ${SWAP_FILE} && \
chmod 600 ${SWAP_FILE} && \
mkswap ${SWAP_FILE} && \
swapon ${SWAP_FILE} && \
swapon -a

# Install prerequisites.
apt-get -y update
apt-get install -y git curl docker.io docker-compose
docker pull ghcr.io/alexander-danilenko/ua-loadtest:latest

# Download example docker-compose.yml file.
curl -fSL -o \
  $TARGET_DIR/docker-compose.yml \
  https://raw.githubusercontent.com/alexander-danilenko/ua-loadtest/master/examples/docker-compose.yml

# Start docker-compose in detached mode.
docker-compose --file $TARGET_DIR/docker-compose.yml up -d
