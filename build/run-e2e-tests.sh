#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}

make -C tests install-oc
make -C login-oc
make run-all-tests
