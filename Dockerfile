#
# Copyright 2019 IBM Corporation
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

FROM node:8-alpine

ARG ARCH

ADD downloads/kubectl-linux-${ARCH} /usr/local/bin/kubectl
ADD downloads/helm-linux-${ARCH}.tar.gz /usr/local/helm/
ADD downloads/cloudctl-linux-${ARCH} /usr/local/bin/cloudctl
ADD downloads/istioctl-linux-${ARCH} /usr/local/bin/istioctl
# add bin for helm
ADD root /


ENV PORT 3000
EXPOSE 3000/tcp

# default passphrase for the self-signed certificates; this Dockerfile
# is intended only for testing, do not use this for productioncd 
ENV PASSPHRASE kuishell
ENV NOBODY_GID 99 

WORKDIR /kui-proxy/kui



# we will download a gamut of helm clients and place them here
# see plugins/plugin-k8s/src/lib/util/discovery/helm-client.ts
# ENV KUI_HELM_CLIENTS_DIR=/usr/local/bin
# ENV HELM_LATEST_VERSION="${KUI_HELM_CLIENTS_DIR}"/helm

RUN apk add --no-cache ca-certificates bash git

###########

RUN ln -s /usr/local/helm/linux-${ARCH}/helm /usr/local/bin/helm_original  && chmod 755 /usr/local/bin/*

COPY ./tmp/kui /kui-proxy/kui
RUN cd /kui-proxy/kui && apk add python make g++ && npm rebuild node-pty --update-binary && apk del python make g++



CMD [ "npm", "start" ]
