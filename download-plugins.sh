#!/bin/bash

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
  repo_name=$1
  filename=$2

  echo "Downloading $repo_name ..."

  releases=$(curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.ibm.com/repos/IBMPrivateCloud/$repo_name/releases | jq '.[0]')
  release_id=$(echo $releases | jq '.id')
  asset_id=$(echo $releases | jq '.assets[0].id')
  echo "RELEASE ID:  $release_id"
  echo "ASSET ID:  $asset_id"

  curl -H "Authorization: token $GITHUB_TOKEN" -vs "https://media.github.ibm.com/releases/$release_id/files/$asset_id" > "plugin-downloads/$filename.tgz"

  echo "Downloaded $file_name.tgz to plugin-downloads/"
}

echo "Regenerating plugin-downloads directory"
rm -rf plugin-downloads
mkdir plugin-downloads

echo "Downloading plugins ..."
download "search-kui-plugin" "plugin-search"

echo "plugin-downloads:"
ls plugin-downloads
