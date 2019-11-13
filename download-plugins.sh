#!/bin/bash

# Licensed Materials - Property of IBM
# Copyright IBM Corporation 2019. All Rights Reserved.
# U.S. Government Users Restricted Rights -
# Use, duplication or disclosure restricted by GSA ADP
# IBM Corporation - initial API and implementation

if [ -z "$GITHUB_TOKEN" ]; then
    echo "GITHUB_TOKEN environment variable must be set"
    exit 1
fi

download() {
  if [ -z $1 ]; then
    echo -e "Plugin GitHub repository name is not set."
    exit 1
  fi
  if [ -z $2 ]; then
    echo -e "Plugin file name is not set."
    exit 1
  fi
  if [ -z $3 ]; then
    echo -e "Plugin version is not set."
    exit 1
  fi
  repo_name=$1
  filename=$2
  version=$3

  echo "Downloading $repo_name ..."

  releases=$(curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.ibm.com/repos/IBMPrivateCloud/$repo_name/releases)
  release=$(echo $releases | jq --arg version "$version" '.[] | select(.name == $version)')
  release_id=$(echo "$release" | jq '.id')
  asset_id=$(echo "$release" | jq '.assets[0].id')

  echo "RELEASE ID:  $release_id"
  echo "ASSET ID:  $asset_id"

  curl -f -H "Authorization: token $GITHUB_TOKEN" -vs "https://media.github.ibm.com/releases/$release_id/files/$asset_id" > "plugin-downloads/$filename.tgz" || exit -1

  echo "Downloaded $file_name.tgz to plugin-downloads/"
}

echo "Regenerating plugin-downloads directory"
rm -rf plugin-downloads
mkdir plugin-downloads

echo "Downloading plugins ..."
download "search-kui-plugin" "plugin-search" "v2.0.40"
download "plugin-kui-addons" "plugin-kui-addons" "v2.0.1"

echo "plugin-downloads:"
ls -l plugin-downloads
