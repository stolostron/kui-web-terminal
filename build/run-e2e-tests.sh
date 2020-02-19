#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}

make install-oc
make login-oc
make run-all-tests
