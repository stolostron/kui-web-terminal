#!/bin/bash
set -x
set -e

function fold_start() {
  echo -e "travis_fold:start:$1\033[33;1m$2\033[0m"
}

function fold_end() {
  echo -e "\ntravis_fold:end:$1\r"
}

export DOCKER_IMAGE_AND_TAG=${1}
export TEST_IMAGE_AND_TAG=$(echo $DOCKER_IMAGE_AND_TAG | sed 's/kui-web-terminal:/kui-web-terminal-tests:/g')
export USER_NAME=$(git log -1 --pretty="%aN" | sed 's/[^a-zA-Z0-9]*//g')

# To block build of unnecessary docker image during make webpack
export NO_DOCKER=true

fold_start download-clis "DOWNLOADING CLIS"
make download-clis
fold_end download-clis

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

fold_start build-test-image "BUILD TEST IMAGE"
make build-test-image
fold_end build-test-image

docker tag $DOCKER_IMAGE_AND_TAG `echo $DOCKER_IMAGE_AND_TAG | sed "s/:.*/:${USER_NAME}/g"`
