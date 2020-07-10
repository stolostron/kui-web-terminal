#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}

echo "Running image: ${DOCKER_IMAGE_AND_TAG}"
sudo make -C tests install-oc
make -C tests login-oc
make run-all-tests
