#!/bin/bash

# Licensed Materials - Property of IBM
# Copyright IBM Corporation 2018. All Rights Reserved.
# U.S. Government Users Restricted Rights -
# Use, duplication or disclosure restricted by GSA ADP
# IBM Corporation - initial API and implementation

set -e

if [ -z "$ARTIFACTORY_USER" ]; then
    echo "ARTIFACTORY_USER environment variable must be set"
    exit 1
fi

if [ -z "$ARTIFACTORY_KEY" ]; then
    echo "ARTIFACTORY_KEY environment variable must be set"
    exit 1
fi

if [ -z "$ARTIFACTORY_URL" ]; then
    echo "ARTIFACTORY_URL environment variable must be set"
    exit 1
fi

ARCH=$(uname -m | sed 's/x86_64/amd64/g')

ISTIO_VER=1.0.2
DOCKER_REGISTRY=hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com
DOCKER_NAMESPACE=ibmcom
CLOUDCTL_VER=latest
CLOUDCTL_IMAGE=$DOCKER_REGISTRY/$DOCKER_NAMESPACE/icp-platform-api-$ARCH:$CLOUDCTL_VER
ICP_VER=4.1.0

rm -rf downloads
mkdir -p downloads

echo "Downloading cloudctl $CLOUDCTL_IMAGE ..."
docker pull $CLOUDCTL_IMAGE
docker run -u root --entrypoint sh -v $(pwd)/downloads:/downloads $CLOUDCTL_IMAGE -c "cp /etc/platform-api/public/cli/cloudctl-linux-${ARCH} /downloads/"
echo "Downloaded cloudctl-linux-${ARCH} to downloads/"

echo "Downloading istioctl ..."
docker run -u root --entrypoint sh -v $(pwd)/downloads:/downloads $CLOUDCTL_IMAGE -c "cp /etc/platform-api/public/cli/istioctl-linux-${ARCH} /downloads/"
echo "Downloaded istioctl-linux-${ARCH} to downloads/"

echo "Downloading kubectl ..."
docker run -u root --entrypoint sh -v $(pwd)/downloads:/downloads $CLOUDCTL_IMAGE -c "cp /etc/platform-api/public/cli/kubectl-linux-${ARCH} /downloads/"
echo "Downloaded kubectl-linux-${ARCH} to downloads/"

echo "Downloading helm ..."
docker run -u root --entrypoint sh -v $(pwd)/downloads:/downloads $CLOUDCTL_IMAGE -c "cp /etc/platform-api/public/cli/helm-linux-${ARCH}.tar.gz /downloads/"
echo "Downloaded helm-linux-${ARCH}.tar.gz to downloads/"