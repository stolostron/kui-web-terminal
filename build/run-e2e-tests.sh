#!/bin/bash
set -e

export DOCKER_IMAGE_AND_TAG=${1}
export TEST_IMAGE_AND_TAG=$(echo $DOCKER_IMAGE_AND_TAG | sed 's/kui-web-terminal:/kui-web-terminal-tests:/g')

echo "Running image: ${DOCKER_IMAGE_AND_TAG}"
sudo make -C tests install-oc
make -C tests login-oc
make run



# get base domain
if [ -z ${K8S_BASE_DOMAIN} ] ; then
    K8S_BASE_DOMAIN=`echo ${K8S_CLUSTER_MASTER_IP} | sed 's/^.*\.apps\.//g' | sed 's/\/.*$//g'`
fi

# set up options.yaml & test-output folder
mkdir -p test-output

cat << EOF > options.yaml
options:
  hub:
    baseDomain: ${K8S_BASE_DOMAIN}
    user: ${K8S_CLUSTER_USER}
    password: ${K8S_CLUSTER_PASSWORD}
EOF

# start test container
echo "Testing with image: ${TEST_IMAGE_AND_TAG}"
docker run -it --network="host" -e TEST_LOCAL=true --volume $(pwd)/test-output:/results --volume $(pwd)/options.yaml:/resources/options.yaml ${TEST_IMAGE_AND_TAG}
