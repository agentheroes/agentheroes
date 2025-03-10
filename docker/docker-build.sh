#!/bin/bash

set -o xtrace

docker rmi localhost/agentheroes || true
docker build -t localhost/agentheroes -f Dockerfile .