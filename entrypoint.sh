#!/bin/sh -e

#
# Copyright 2020 IBM Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


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