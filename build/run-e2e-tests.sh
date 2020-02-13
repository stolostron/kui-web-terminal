#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}

function fold_start() {
  echo -e "travis_fold:start:$1\033[33;1m$2\033[0m"
}

function fold_end() {
  echo -e "\ntravis_fold:end:$1\r"
}

fold_start tests "TESTS"
make run-all-tests
fold_end tests

fold_start logs "LOGS"
docker logs kui-web-terminal
fold_end logs