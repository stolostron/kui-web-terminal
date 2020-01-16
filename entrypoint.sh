#!/bin/sh -e

# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2020. All Rights Reserved.
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.


if [ ! -z ${ENABLE_EXTENSIONS} ] && [ ${ENABLE_EXTENSIONS} = 'true' ] ; then
    echo 'Extensions enabled'
    echo 'Moving extensions'
    if [ ! -z "${DOWNLOAD_PATH}" ] && [ -d "${DOWNLOAD_PATH}" ] && [ -d "${DOWNLOAD_PATH}/${CLI_FOLDER}" ] ; then
        for filename in "${DOWNLOAD_PATH}/${CLI_FOLDER}"/* ; do
            if [ -f "${filename}" ] ; then
                echo "chmod a+x ${filename} && mv ${filename} /usr/local/bin/ "
                chmod a+x "${filename}" && mv "${filename}" /usr/local/bin/ 
            fi
        done
    fi
fi
echo 'starting'
npm start