ARG ARCH

# To support downstream builds, use full ubi8 + nodeJS 10 built in until an official
# ubi8-minimal/nodejs-10 base image may become available.
# FROM registry.access.redhat.com/ubi8-minimal:8.1-398
FROM registry.access.redhat.com/ubi8/nodejs-14:1

ARG VCS_REF
ARG VCS_URL
ARG IMAGE_NAME
ARG IMAGE_DISPLAY_NAME
ARG IMAGE_MAINTAINER
ARG IMAGE_VENDOR
ARG IMAGE_VERSION
ARG IMAGE_DESCRIPTION
ARG IMAGE_DESCRIPTION_SHORT
ARG IMAGE_SUMMARY
ARG IMAGE_OPENSHIFT_TAGS
ARG ARCH

ADD downloads/kubectl-linux-${ARCH} /usr/local/bin/kubectl
ADD downloads/helm-linux-${ARCH} /usr/local/bin/helm
ADD downloads/oc-linux-${ARCH} /usr/local/bin/oc

LABEL org.label-schema.vendor="Red Hat" \
      org.label-schema.name="$IMAGE_NAME" \
      org.label-schema.description="$IMAGE_DESCRIPTION" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-url=$VCS_URL \
      org.label-schema.license="Red Hat Advanced Cluster Management for Kubernetes EULA" \
      org.label-schema.schema-version="1.0" \
      name="$IMAGE_NAME" \
      maintainer="$IMAGE_MAINTAINER" \
      vendor="$IMAGE_VENDOR" \
      version="$IMAGE_VERSION" \
      release="$VCS_REF" \
      summary="$IMAGE_DESCRIPTION_SHORT" \
      description="$IMAGE_DESCRIPTION" \
      io.k8s.display-name="$IMAGE_DISPLAY_NAME" \
      io.k8s.description="$IMAGE_DESCRIPTION" \
      io.openshift.tags="$IMAGE_OPENSHIFT_TAGS"


# Not needed based on use of ubi8/nodejs-10 base image above
# Add NodeJS to the image
# ENV NODE_VERSION=10.16.3
ENV PATH="${PATH}:/node/bin"

# Not needed based on use of ubi8/nodejs-10 base image above
# RUN microdnf install gzip tar && \
#     mkdir /node && \
#     NodeImage=node-v${NODE_VERSION}-linux-$(uname -m | sed 's/x86_64/x64/').tar.gz && \
#     for key in \
#       94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
#       FD3A5288F042B6850C66B31F09FE44734EB7990E \
#       71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
#       DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
#       C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
#       B9AE9905FFD7803F25714661B63B535A4C206CA9 \
#       77984A986EBC2AA786BC0F66B01FBB92821C587A \
#       8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
#       4ED778F539E3634C779C87C6D7062848A1AB005C \
#       A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
#       B9E2F5981AA6E0CD28160D9FF13993A75599653C \
#       ; do \
#       gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
#       gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
#       gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
#     done && \
#     curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/$NodeImage" && \
#     curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" && \
#     gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc && \
#     grep " $NodeImage\$" SHASUMS256.txt | sha256sum -c - && \
#     tar -zxf $NodeImage -C /node  --strip-components=1 && \
#     rm -f $NodeImage SHASUMS256.txt.asc && \
#     microdnf remove tar gzip && \
#     microdnf clean all
# End section

ENV PORT 3000
EXPOSE 3000/tcp

# ## Do not think this PASSPHRASE is used anymore...commenting out in anticipation of removing
# default passphrase for the self-signed certificates; this Dockerfile
# is intended only for testing, do not use this for productioncd
# ENV PASSPHRASE kuishell
ENV NOBODY_GID 65534

# For use when using ubi or ubi-minimal image
ENV LINUX_DISTRO rhel

# ubi8/nodejs-10 base image seems to need this
USER root

# Remove nodejs-nodemon as 1) it is not needed by kui 2) it has package vulnerabilities
# See: https://github.com/open-cluster-management/backlog/issues/2741
# AND Keep image up-to-date
RUN yum -y remove nodejs-nodemon && \
    yum --nobest -y update

WORKDIR /kui-proxy/kui



# we will download a gamut of helm clients and place them here
# see plugins/plugin-k8s/src/lib/util/discovery/helm-client.ts
# ENV KUI_HELM_CLIENTS_DIR=/usr/local/bin
# ENV HELM_LATEST_VERSION="${KUI_HELM_CLIENTS_DIR}"/helm

# Not needed based on use of ubi8/nodejs-10 base image above
# For UBI-minimal need to use microdnf (UBI already includes bash but needs shadow-utils for adduser)
# RUN microdnf install \
#     ca-certificates \
#     shadow-utils \
#     vim-minimal \
#     which \
#     && microdnf clean all
#
###########

RUN sed -i -e 's/UMASK\t\t022/UMASK\t\t077/g' /etc/login.defs \
    && sed -i -e 's/USERGROUPS_ENAB yes/USERGROUPS_ENAB no/g' /etc/login.defs \
    && sed -i '$ a DIR_MODE=0700' /etc/default/useradd \
    && sed -i -e 's/PS1=\"\[\\u@\\h \\W\]/PS1=\"/g' /etc/bashrc \
    && sed -i -e 's|export PATH|# Set PATH for our use of rbash\nPATH=/usr/local/bin\nexport PATH|g' /etc/skel/.bashrc \
    && echo "alias ls='ls -l'" >> /etc/skel/.bashrc \
    && echo "alias vi='rvim'" >> /etc/skel/.bashrc \
    && echo "alias vim='rvim'" >> /etc/skel/.bashrc \
    && echo "enable -n kill"  >> /etc/skel/.bashrc \
    && echo "enable -n unalias" >> /etc/skel/.bashrc \
    && echo "readonly KUBE_EDITOR=rvim" >> /etc/skel/.bashrc

RUN cp /usr/bin/bash /usr/bin/rbash \
    && mv /usr/bin/vi /usr/bin/rvim \
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
    && ln -s /bin/touch /usr/local/bin/touch \
    && ln -s /bin/uname /usr/local/bin/uname \
    && ln -s /usr/bin/base64 /usr/local/bin/base64 \
    && ln -s /usr/bin/basename /usr/local/bin/basename \
    && ln -s /usr/bin/cksum /usr/local/bin/cksum \
    && ln -s /usr/bin/cut /usr/local/bin/cut \
    && ln -s /usr/bin/dirname /usr/local/bin/dirname \
    && ln -s /usr/bin/head /usr/local/bin/head \
    && ln -s /usr/bin/printf /usr/local/bin/printf \
    && ln -s /usr/bin/rvim /usr/local/bin/rvim \
    && ln -s /usr/bin/tail /usr/local/bin/tail \
    && ln -s /usr/bin/sleep /usr/local/bin/sleep \
    && chmod 755 /etc/profile.d/*.sh \
    && chmod 755 /usr/local/bin/*


COPY ./tmp/kui /kui-proxy/kui
# copy the client webpack bundles and other artifacts into the proxy app/public folder
COPY ./client/dist/webpack /kui-proxy/kui/app/public
RUN mv /kui-proxy/kui/app/public/kui/* /kui-proxy/kui/app/public
COPY ./client/fonts /kui-proxy/kui/app/public/fonts
COPY ./proxy/app/views/main.handlebars /kui-proxy/kui/app/views/layouts/main.handlebars

RUN cd /kui-proxy/kui

# Folder permissions
RUN chmod 751 /home && chmod 751 /kui-proxy && chmod 751 /kui-proxy/kui

ENV NODE_ENV production
CMD [ "npm", "start" ]
