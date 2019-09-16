#!/bin/bash

# Licensed Materials - Property of IBM
# Copyright IBM Corporation 2018. All Rights Reserved.
# U.S. Government Users Restricted Rights -
# Use, duplication or disclosure restricted by GSA ADP
# IBM Corporation - initial API and implementation

set -e


ARCH=$(uname -m | sed 's/x86_64/amd64/g')

ISTIO_VER=1.0.2
DOCKER_REGISTRY=hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com
DOCKER_NAMESPACE=ibmcom
CLOUDCTL_VER=latest
CLOUDCTL_IMAGE=$DOCKER_REGISTRY/$DOCKER_NAMESPACE/icp-platform-api-$ARCH:$CLOUDCTL_VER
ICP_VER=3.2.1

rm -rf downloads
mkdir -p downloads

echo "Downloading cloudctl $CLOUDCTL_IMAGE ..."
docker pull $CLOUDCTL_IMAGE

echo "running cloudctl image for file downloads" 
CLOUDCTL_CONTAINER_NAME=temp-cont-download-cli
docker run --name ${CLOUDCTL_CONTAINER_NAME}  -d --entrypoint tail $CLOUDCTL_IMAGE -f /dev/null
CLOUDCTL_CONTAINER_ID=`docker ps -f name=temp-cont-download-cli -q`
echo "container id: ${CLOUDCTL_CONTAINER_ID}" 

echo "Downloading cloudctl ..."
docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/cloudctl-linux-${ARCH}" $(pwd)/downloads/

echo "Downloading istioctl ..."
docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/istioctl-linux-${ARCH}" $(pwd)/downloads/

echo "Downloading kubectl ..."
docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/kubectl-linux-${ARCH}" $(pwd)/downloads/

echo "Downloading helm ..."
docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/helm-linux-${ARCH}.tar.gz" $(pwd)/downloads/

# stop container
echo "stop container"
docker stop $CLOUDCTL_CONTAINER_NAME
docker rm  $CLOUDCTL_CONTAINER_NAME
echo "ls -l downloads"
ls -l downloads

echo "checking results"
[[ ! -f "downloads/cloudctl-linux-${ARCH}" ]] && echo "download cloudctl failed" && exit -1
echo "Downloaded cloudctl-linux-${ARCH} to downloads/"
[[ ! -f "downloads/istioctl-linux-${ARCH}" ]] && echo "download istioctl failed" && exit -1
echo "Downloaded istioctl-linux-${ARCH} to downloads/"
[[ ! -f "downloads/kubectl-linux-${ARCH}" ]] && echo "download istioctl failed" && exit -1
echo "Downloaded istioctl-linux-${ARCH} to downloads/"
[[ ! -f "downloads/helm-linux-${ARCH}.tar.gz" ]] && echo "download helm failed" && exit -1
echo "Downloaded helm-linux-${ARCH}.tar.gz to downloads/"

if [ "$ARCH" = "amd64" ]; then
  echo "Downloading oc ..."
  curl -fksSL https://mirror.openshift.com/pub/openshift-v4/clients/ocp/4.1.11/openshift-client-linux-4.1.11.tar.gz | tar -xvz -C ./downloads/ oc  
  [[ ! -f "downloads/oc" ]] && echo "download oc failed" && exit -1
  mv ./downloads/oc ./downloads/oc-linux-amd64
  echo "Downloaded openshift origin to downloads/"
fi

if [ "$ARCH" = "ppc64le" ]; then
  echo "Downloading oc ..."
  curl -fksSL https://mirror.openshift.com/pub/openshift-v4/clients/oc/4.1.11-201908130027.git.0.150bde9.el7/linux-ppc64le/oc.tar.gz | tar -xvz -C ./downloads/ oc 
  [[ ! -f "downloads/oc" ]] && echo "download oc failed" && exit -1
  mv ./downloads/oc ./downloads/oc-linux-ppc64le
  echo "Downloaded openshift origin to downloads/"
fi