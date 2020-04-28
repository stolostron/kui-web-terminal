#!/bin/bash
set -e

echo "> Running build/run-unit-tests.sh"
make install
make run-plugin-tests