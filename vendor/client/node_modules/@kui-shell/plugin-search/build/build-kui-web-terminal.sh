#!/bin/bash

# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2019. All Rights Reserved.
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.

set -e

git clone --depth=50 https://github.com/open-cluster-management/kui-web-terminal.git
cd kui-web-terminal/

echo "TODO: Re-enable building the test image."

make init
make download-clis
make download-plugins
rm plugin-downloads/plugin-search.tgz
cp ../../plugin-search.tgz ./plugin-downloads

make -C client client-update-plugins

echo "Installing proxy and client"
make install-proxy
make install-client
make webpack
make headless
make build-image

cd ../..
