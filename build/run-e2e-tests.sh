#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}
export TEST_IMAGE_AND_TAG=$(echo $DOCKER_IMAGE_AND_TAG | sed 's/kui-web-terminal:/kui-web-terminal-tests:/g')

echo "Running image: ${DOCKER_IMAGE_AND_TAG}"
sudo make -C tests install-oc
make -C tests login-oc
# Original way to run tests
make -v run-all-tests


#Possible new way to run tests using dockerized container
# WORK IN PROGRESS
#
#
## get base domain
#    K8S_BASE_DOMAIN=`echo ${K8S_CLUSTER_MASTER_IP} | sed 's/^.*\.apps\.//g' | sed 's/\/.*$//g'`
#fi
#
## set up options.yaml & test-output folder
#mkdir -p test-output
#
#cat << EOF > options.yaml
#options:
#  hub:
#    baseDomain: ${K8S_BASE_DOMAIN}
#    user: ${K8S_CLUSTER_USER}
#    password: ${K8S_CLUSTER_PASSWORD}
#EOF
#
## start test container
#echo "Testing with image: ${TEST_IMAGE_AND_TAG}"
#make run-test-image
