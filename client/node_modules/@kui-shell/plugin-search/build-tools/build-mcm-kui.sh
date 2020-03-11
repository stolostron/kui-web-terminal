#!/bin/bash

# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2019. All Rights Reserved.
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.

git clone git@github.ibm.com:IBMPrivateCloud/mcm-kui.git -b 5.7.x-bump-with-search
cd mcm-kui/

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

docker tag mcm-kui-proxy:latest mcm-kui-proxy:$(cat RELEASE_VERSION)

cd ../..
make run

#TODO add our tests ^^