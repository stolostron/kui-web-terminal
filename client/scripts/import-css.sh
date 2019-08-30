#!/bin/bash

# Licensed Materials - Property of IBM
# Copyright IBM Corporation 2019. All Rights Reserved.
# U.S. Government Users Restricted Rights -
# Use, duplication or disclosure restricted by GSA ADP
# IBM Corporation - initial API and implementation

GITHUB_BASE_URL="https://raw.githubusercontent.com/IBM/kui/master/clients/alternate/theme/css/"
REPO_BASE_PATH="theme/css/"

BASE_CSS=$(ls $REPO_BASE_PATH | grep .css)
THEME_CSS=$(ls $REPO_BASE_PATH/themes | grep .css)

for FILE in $BASE_CSS
do
  URL_PATH=$GITHUB_BASE_URL$FILE
  REPO_PATH=$REPO_BASE_PATH$FILE
  curl $URL_PATH > $REPO_PATH
done

for FILE in $THEME_CSS
do
  THEME="themes/"
  URL_PATH="$GITHUB_BASE_URL$THEME$FILE"
  REPO_PATH="$REPO_BASE_PATH$THEME$FILE"
  curl $URL_PATH > $REPO_PATH
done
