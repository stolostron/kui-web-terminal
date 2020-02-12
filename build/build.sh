#!/bin/bash
set -e

function fold_start() {
  echo -e "travis_fold:start:$1\033[33;1m$2\033[0m"
}

function fold_end() {
  echo -e "\ntravis_fold:end:$1\r"
}

export DOCKER_IMAGE_AND_TAG=${1}

fold_start install "INSTALL"
make install
fold_end install

fold_start webpack "WEBPACK"
make webpack
fold_end webpack

fold_start headless "HEADLESS"
make headless
fold_end headless

fold_start build-image "BUILD IMAGE"
make build-image
fold_end build-image
