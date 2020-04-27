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

if [ "$ARCH" = "amd64" ]; then
  echo "Downloading oc & kubectl ..."
  curl -fksSL https://mirror.openshift.com/pub/openshift-v4/clients/ocp/4.3.0/openshift-client-linux-4.3.0.tar.gz | tar -xvz -C ./downloads/ oc kubectl  
  [[ ! -f "downloads/oc" ]] && echo "download oc failed" && exit -1
  mv ./downloads/oc ./downloads/oc-linux-amd64
  [[ ! -f "downloads/kubectl" ]] && echo "download kubectl failed" && exit -1
  mv ./downloads/kubectl ./downloads/kubectl-linux-amd64
  echo "Downloaded openshift origin to downloads/"

  echo "Downloading helm v3..."
  curl -fksSL https://mirror.openshift.com/pub/openshift-v4/clients/helm/latest/helm-linux-amd64 -o ./downloads/helm-linux-amd64
  [[ ! -f "downloads/helm-linux-amd64" ]] && echo "download helm failed" && exit -1
  echo "Downloaded helm v3 to downloads/"

fi