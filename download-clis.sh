#!/bin/bash

# Licensed Materials - Property of IBM
# Copyright IBM Corporation 2018. All Rights Reserved.
# U.S. Government Users Restricted Rights -
# Use, duplication or disclosure restricted by GSA ADP
# IBM Corporation - initial API and implementation

set -e


ARCH=$(uname -m | sed 's/x86_64/amd64/g')

DOCKER_REGISTRY=hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com
DOCKER_NAMESPACE=ibmcom
CLOUDCTL_VER=latest
CLOUDCTL_IMAGE=$DOCKER_REGISTRY/$DOCKER_NAMESPACE/icp-platform-api-$ARCH:$CLOUDCTL_VER


# echo "Downloading cloudctl $CLOUDCTL_IMAGE ..."
# docker pull $CLOUDCTL_IMAGE

# echo "running cloudctl image for file downloads" 
# CLOUDCTL_CONTAINER_NAME=temp-cont-download-cli
# docker run --name ${CLOUDCTL_CONTAINER_NAME}  -d --entrypoint tail $CLOUDCTL_IMAGE -f /dev/null
# CLOUDCTL_CONTAINER_ID=`docker ps -f name=temp-cont-download-cli -q`
# echo "container id: ${CLOUDCTL_CONTAINER_ID}" 

# echo "Downloading cloudctl ..."
# docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/cloudctl-linux-${ARCH}" $(pwd)/downloads/

# echo "Downloading kubectl ..."
# docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/kubectl-linux-${ARCH}" $(pwd)/downloads/

# echo "Downloading helm ..."
# docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/helm-linux-${ARCH}.tar.gz" $(pwd)/downloads/

# echo "Downloading oc ..."
# docker cp ${CLOUDCTL_CONTAINER_ID}:"/etc/platform-api/public/cli/oc-linux-${ARCH}" $(pwd)/downloads/

# # stop container
# echo "stop container"
# docker stop $CLOUDCTL_CONTAINER_NAME
# docker rm  $CLOUDCTL_CONTAINER_NAME
# echo "ls -l downloads"
# ls -l downloads

# echo "checking results"
# [[ ! -f "downloads/cloudctl-linux-${ARCH}" ]] && echo "download cloudctl failed" && exit -1
# echo "Downloaded cloudctl-linux-${ARCH} to downloads/"
# [[ ! -f "downloads/kubectl-linux-${ARCH}" ]] && echo "download kubectl failed" && exit -1
# echo "Downloaded kubectl-linux-${ARCH} to downloads/"
# [[ ! -f "downloads/helm-linux-${ARCH}.tar.gz" ]] && echo "download helm failed" && exit -1
# echo "Downloaded helm-linux-${ARCH}.tar.gz to downloads/"
# [[ ! -f "downloads/oc-linux-${ARCH}" ]] && echo "download oc failed" && exit -1
# echo "Downloaded oc-linux-${ARCH} to downloads/"

if [ "$ARCH" = "amd64" ]; then
  echo "Downloading oc & kubectl ..."
  curl -fksSL https://mirror.openshift.com/pub/openshift-v4/clients/ocp/4.3.0/openshift-client-linux-4.3.0.tar.gz | tar -xvz -C ./downloads/ oc kubectl  
  [[ ! -f "downloads/oc" ]] && echo "download oc failed" && exit -1
  mv ./downloads/oc ./downloads/oc-linux-amd64
  [[ ! -f "downloads/kubectl" ]] && echo "download kubectl failed" && exit -1
  mv ./downloads/kubectl ./downloads/kubectl-linux-amd64
  echo "Downloaded openshift origin to downloads/"
fi