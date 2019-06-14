#!/bin/bash

# Move the generated headless files into a new folder for docker build
CURRENT_FOLDER=`dirname "$0"`
HEADLESS_FOLDER="${CURRENT_FOLDER}/../proxy/kui"
DIST_FOLDER="${CURRENT_FOLDER}/../proxy/dist"
TEMP_FOLDER='tmp'
if [ -z $1 ]; then
   TEMP_FOLDER=$1 
fi

# Check headless folder
[[ -d "${HEADLESS_FOLDER}" ]]  || { echo "${HEADLESS_FOLDER}"; exit 1; }

# remove previous temp folder
[[ -d "$TEMP_FOLDER" ]] && rm -r "$TEMP_FOLDER"

echo "Moving all files to: $TEMP_FOLDER"
mv "$HEADLESS_FOLDER" "${TEMP_FOLDER}"

echo "Removing tar files in dist"
rm -r "$DIST_FOLDER"


echo "Copying keys for https"
[[ -d .keys ]] || bash "${CURRENT_FOLDER}/ssl.sh"
cp -r .keys "${TEMP_FOLDER}/"


