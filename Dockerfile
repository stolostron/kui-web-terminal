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

ENV PORT 3000
EXPOSE 3000/tcp

# default passphrase for the self-signed certificates; this Dockerfile
# is intended only for testing, do not use this for productioncd 
ENV PASSPHRASE kuishell

WORKDIR /kui-proxy/kui

# the following from https://github.com/dtzar/helm-kubectl/blob/2.12.2/Dockerfile
###########
# Note: Latest version of kubectl may be found at:
# https://aur.archlinux.org/packages/kubectl-bin/
ENV KUBE_LATEST_VERSION="v1.13.2"
# Note: Latest version of helm may be found at:
# https://github.com/kubernetes/helm/releases

# we will download a gamut of helm clients and place them here
# see plugins/plugin-k8s/src/lib/util/discovery/helm-client.ts
ENV KUI_HELM_CLIENTS_DIR=/usr/local/bin
ENV HELM_LATEST_VERSION="${KUI_HELM_CLIENTS_DIR}"/helm-2.12

RUN apk add --no-cache ca-certificates bash git \
    && wget -q https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -O /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kubectl \
    && wget -q https://storage.googleapis.com/kubernetes-helm/helm-v2.9.0-linux-amd64.tar.gz -O - | tar -xzO linux-amd64/helm > /usr/local/bin/helm-2.9 \
    && chmod +x /usr/local/bin/helm-2.9 \
    && wget -q https://storage.googleapis.com/kubernetes-helm/helm-v2.10.0-linux-amd64.tar.gz -O - | tar -xzO linux-amd64/helm > /usr/local/bin/helm-2.10 \
    && chmod +x /usr/local/bin/helm-2.10 \
    && wget -q https://storage.googleapis.com/kubernetes-helm/helm-v2.11.0-linux-amd64.tar.gz -O - | tar -xzO linux-amd64/helm > /usr/local/bin/helm-2.11 \
    && chmod +x /usr/local/bin/helm-2.11 \
    && wget -q https://storage.googleapis.com/kubernetes-helm/helm-v2.12.2-linux-amd64.tar.gz -O - | tar -xzO linux-amd64/helm > /usr/local/bin/helm-2.12 \
    && chmod +x /usr/local/bin/helm-2.12
###########

COPY ./tmp/kui /kui-proxy/kui
RUN cd /kui-proxy/kui && apk add python make g++ && npm rebuild node-pty --update-binary && apk del python make g++


CMD [ "npm", "start" ]
