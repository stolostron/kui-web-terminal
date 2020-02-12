#!/bin/bash
set -e

make download-plugins
make install-proxy
make lint-proxy
make copyright-check