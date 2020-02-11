#!/bin/bash
set -e

make install
# make webpack
# make headless
make build-image
