#!/bin/bash
set -e

source ./build.sh

export DOCKER_IMAGE_AND_TAG=${1}

fold_start tests "TESTS"
make run-all-tests
fold_end tests

fold_start logs "LOGS"
docker logs kui-web-terminal
fold_end logs