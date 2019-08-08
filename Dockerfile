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

ARG ARCH
# FROM node:8-alpine
FROM hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com/build-images/node-${ARCH}:dubnium-ubi7.6-123-minimal

ARG VCS_REF
ARG VCS_URL
ARG IMAGE_NAME
ARG IMAGE_DESCRIPTION
ARG ARCH

ADD downloads/kubectl-linux-${ARCH} /usr/local/bin/kubectl
ADD downloads/helm-linux-${ARCH}.tar.gz /usr/local/helm/
ADD downloads/cloudctl-linux-${ARCH} /usr/local/bin/cloudctl
ADD downloads/istioctl-linux-${ARCH} /usr/local/bin/istioctl
# add bin for helm
ADD root /

LABEL org.label-schema.vendor="IBM" \
      org.label-schema.name="$IMAGE_NAME" \
      org.label-schema.description="$IMAGE_DESCRIPTION" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url=$VCS_URL \
      org.label-schema.license="Licensed Materials - Property of IBM" \
      org.label-schema.schema-version="1.0"


ENV PORT 3000
EXPOSE 3000/tcp

# default passphrase for the self-signed certificates; this Dockerfile
# is intended only for testing, do not use this for productioncd 
ENV PASSPHRASE kuishell
ENV NOBODY_GID 99
# For use when using ubi-minimal image
ENV LINUX_DISTRO rhel

WORKDIR /kui-proxy/kui



# we will download a gamut of helm clients and place them here
# see plugins/plugin-k8s/src/lib/util/discovery/helm-client.ts
# ENV KUI_HELM_CLIENTS_DIR=/usr/local/bin
# ENV HELM_LATEST_VERSION="${KUI_HELM_CLIENTS_DIR}"/helm

# Following was for alpine image
# RUN apk add --no-cache ca-certificates bash git
#
# For UBI need to use microdnf (UBI already includes bash but needs shadow-utils for adduser)
RUN microdnf install \
    ca-certificates \
    python \
    shadow-utils \
    vim-minimal \
    which \
    && microdnf clean all

###########

RUN sed -i -e 's/UMASK\t\t022/UMASK\t\t077/g' /etc/login.defs \
    && sed -i -e 's/USERGROUPS_ENAB yes/USERGROUPS_ENAB no/g' /etc/login.defs \
    && sed -i '$ a DIR_MODE=0700' /etc/default/useradd \
    && sed -i -e 's/PS1=\"\[\\u@\\h \\W\]/PS1=\"/g' /etc/bashrc \
    && sed -i -e 's|^PATH=.*|PATH=/usr/local/bin|g' /etc/skel/.bash_profile

RUN cp /usr/bin/bash /usr/bin/rbash \
    && cp /usr/bin/vi /usr/bin/rvim \
    && ln -s /bin/cat /usr/local/bin/cat \
    && ln -s /bin/chmod /usr/local/bin/chmod \
    && ln -s /bin/cp /usr/local/bin/cp \
    && ln -s /bin/date /usr/local/bin/date \
    && ln -s /bin/echo /usr/local/bin/echo \
    && ln -s /bin/grep /usr/local/bin/grep \
    && ln -s /bin/ls /usr/local/bin/ls \
    && ln -s /bin/mkdir /usr/local/bin/mkdir \
    && ln -s /bin/mv /usr/local/bin/mv \
    && ln -s /bin/readlink /usr/local/bin/readlink \
    && ln -s /bin/rm /usr/local/bin/rm \
    && ln -s /bin/sed /usr/local/bin/sed \
    && ln -s /bin/touch /usr/local/bin/touch \
    && ln -s /bin/uname /usr/local/bin/uname \
    && ln -s /usr/bin/base64 /usr/local/bin/base64 \
    && ln -s /usr/bin/basename /usr/local/bin/basename \
    && ln -s /usr/bin/cksum /usr/local/bin/cksum \
    && ln -s /usr/bin/clear /usr/local/bin/clear \
    && ln -s /usr/bin/cut /usr/local/bin/cut \
    && ln -s /usr/bin/dirname /usr/local/bin/dirname \
    && ln -s /usr/bin/head /usr/local/bin/head \
    && ln -s /usr/bin/printf /usr/local/bin/printf \
    && ln -s /usr/bin/rvim /usr/local/bin/vim \
    && ln -s /usr/bin/rvim /usr/local/bin/vi \
    && ln -s /usr/bin/tail /usr/local/bin/tail \
    && ln -s /usr/local/helm/linux-${ARCH}/helm /usr/local/bin/helm_original \
    && chmod 755 /etc/profile.d/*.sh \
    && chmod 755 /usr/local/bin/* 


COPY ./tmp/kui /kui-proxy/kui
# copy the client webpack bundles and other artifacts into the proxy app/public folder
COPY ./client/dist/webpack /kui-proxy/kui/app/public

# RUN cd /kui-proxy/kui && apk add python make g++ && npm rebuild node-pty --update-binary && apk del python make g++
RUN cd /kui-proxy/kui
RUN microdnf install make gcc gcc-c++ \
    && microdnf clean all
RUN npm rebuild node-pty --update-binary
RUN microdnf remove make gcc gcc-c++ \
    && microdnf clean all

CMD [ "npm", "start" ]
