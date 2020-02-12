
GIT_REMOTE_URL = $(shell git config --get remote.origin.url)
GITHUB_USER ?= $(ARTIFACTORY_USER)
GITHUB_USER := $(shell echo $(GITHUB_USER) | sed 's/@/%40/g')
GITHUB_TOKEN ?= 

DOCKER_EDGE_REGISTRY ?= hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com
DOCKER_SCRATCH_REGISTRY ?= hyc-cloud-private-scratch-docker-local.artifactory.swg-devops.com
DOCKER_INTEGRATION_REGISTRY ?= hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com
DOCKER_FIXPACK_VIRTUAL_REGISTRY ?= hyc-cloud-private-fixpack-docker-virtual.artifactory.swg-devops.com

WORKING_CHANGES = $(shell git status --porcelain)
BUILD_DATE = $(shell date +%m/%d@%H:%M:%S)
GIT_COMMIT = $(shell git rev-parse --short HEAD)
VCS_REF = $(if $(WORKING_CHANGES),$(GIT_COMMIT)-$(BUILD_DATE),$(GIT_COMMIT))
APP_VERSION ?= $(if $(shell cat VERSION 2> /dev/null),$(shell cat VERSION 2> /dev/null),0.0.1)
# IMAGE_VERSION is only used in an image label so set it to this release version
# IMAGE_VERSION ?= $(APP_VERSION)-$(GIT_COMMIT)
IMAGE_VERSION = $(SEMVERSION)
IMAGE_DISPLAY_NAME = Visual Web Terminal
IMAGE_DESCRIPTION = Visual Web Terminal provides a web based terminal window with enhanced interactive visualzations of command results
IMAGE_DESCRIPTION_SHORT = Visual Web Terminal 
IMAGE_MAINTAINER = kui@us.ibm.com
IMAGE_VENDOR = IBM
IMAGE_SUMMARY = $(IMAGE_DESCRIPTION)
IMAGE_OPENSHIFT_TAGS = visual terminal 


DOCKER_USER ?= $(ARTIFACTORY_USER)
DOCKER_PASS ?= $(ARTIFACTORY_TOKEN)

DOCKER_IMAGE ?= kui-web-terminal

ifeq ($(PUSH_RHEL), true)
	DOCKER_TAG ?= $(SEMVERSION)-rhel
else
	DOCKER_TAG ?= $(SEMVERSION)
endif

ARCH := $(shell uname -m)
OS ?= $(shell uname -r | cut -d '.' -f6)

ifeq ($(ARCH), x86_64)
	ARCH = amd64
endif

# Default to scratch unless a push to master
PUSH_REPO ?= scratch
DOCKER_REGISTRY := $(DOCKER_SCRATCH_REGISTRY)
DOCKER_NAMESPACE := mcm-kui-pr-builds
ifeq ($(PUSH_REPO), integration)
	DOCKER_REGISTRY := $(DOCKER_INTEGRATION_REGISTRY)
	DOCKER_NAMESPACE := ibmcom
endif
ifeq ($(PUSH_REPO), fixpack)
	DOCKER_REGISTRY := $(DOCKER_FIXPACK_VIRTUAL_REGISTRY)
	DOCKER_NAMESPACE := ibmcom-$(ARCH)
endif

.PHONY: init\:
init::
	@mkdir -p variables
ifndef GITHUB_USER
	$(info GITHUB_USER not defined)
	exit -1
endif
	$(info Using GITHUB_USER=$(GITHUB_USER))
ifndef GITHUB_TOKEN
	$(info GITHUB_TOKEN not defined)
	exit -1
endif
# ifndef ARTIFACTORY_TOKEN 
# 	$(info ARTIFACTORY_TOKEN not defined)
# 	exit -1
# endif

-include $(shell curl -H 'Authorization: token ${GITHUB_TOKEN}' -H 'Accept: application/vnd.github.v4.raw' -L https://api.github.com/repos/open-cluster-management/build-harness-extensions/contents/templates/Makefile.build-harness-bootstrap -o .build-harness-bootstrap; echo .build-harness-bootstrap)

SHELL := /bin/bash

.PHONY: docker-login-dev docker-login docker-login-edge docker-logins 
docker-login-dev:
	$(SELF) docker:login DOCKER_REGISTRY=$(DOCKER_SCRATCH_REGISTRY)

docker-login:
	$(SELF) docker:login DOCKER_REGISTRY=$(DOCKER_INTEGRATION_REGISTRY)

docker-login-edge:
	$(SELF) docker:login DOCKER_REGISTRY=$(DOCKER_EDGE_REGISTRY)

docker-logins:
	$(SELF) docker:login DOCKER_REGISTRY=$(DOCKER_INTEGRATION_REGISTRY)
	$(SELF) docker:login DOCKER_REGISTRY=$(DOCKER_SCRATCH_REGISTRY)


TEMP_FOLDER ?= 'tmp' # a temporary folder for headless build
DOCKER_BUILD_OPTS = --build-arg "VCS_REF=$(VCS_REF)" \
                    --build-arg "VCS_URL=$(GIT_REMOTE_URL)" \
					--build-arg "IMAGE_NAME=$(DOCKER_IMAGE_ARCH)" \
					--build-arg "IMAGE_DISPLAY_NAME=$(IMAGE_DISPLAY_NAME)" \
					--build-arg "IMAGE_MAINTAINER=$(IMAGE_MAINTAINER)" \
					--build-arg "IMAGE_VENDOR=$(IMAGE_VENDOR)" \
					--build-arg "IMAGE_VERSION=$(IMAGE_VERSION)" \
					--build-arg "IMAGE_DESCRIPTION=$(IMAGE_DESCRIPTION)" \
					--build-arg "IMAGE_SUMMARY=$(IMAGE_SUMMARY)" \
					--build-arg "IMAGE_OPENSHIFT_TAGS=$(IMAGE_OPENSHIFT_TAGS)" \
					--build-arg "ARCH=$(ARCH)"

.PHONY:	download-plugins
download-plugins:
	@bash download-plugins.sh

.PHONY: install-client
install-client: 
	$(MAKE) -C client $@

.PHONY: install-proxy
install-proxy: 
	$(MAKE) -C proxy $@

.PHONY: install
install: download-plugins install-proxy install-client 
	@echo npm install both client and proxy

.PHONY: headless
headless:
	$(MAKE) -C proxy $@
	@bash scripts/move-headless.sh $(TEMP_FOLDER)

.PHONY: webpack
webpack:
	$(MAKE) -C client $@
	$(SELF) dust-template

.PHONY: download-clis
download-clis: docker-login
	@./download-clis.sh


.PHONY: clean-proxy
clean-proxy:
	rm -rf $(TEMP_FOLDER)
	$(MAKE) -C proxy $@

.PHONY: clean-client
clean-client:
	$(MAKE) -C client $@

.PHONY: clean-downloads
clean-downloads:
	@rm -rf downloads
	@rm -rf plugin-downloads

.PHONY: clean-kui
clean-kui: clean-client clean-proxy clean-downloads
	@echo Clean for both client and proxy
	@echo Clean downloads

.PHONY: lint
lint: lint-proxy
	@echo Lint on proxy

.PHONY: lint-proxy
lint-proxy:
	$(MAKE) -C proxy $@

.PHONY: copyright-check
copyright-check:
	@bash ./copyright-check.sh

.PHONY: build-image
build-image:
	@echo "Building mcm-kui image"
	$(SELF) docker/build

# Push docker image to artifactory
.PHONY: release
release:
ifeq ($(PUSH_REPO),fixpack)
	$(SELF) docker:tag
	@echo "Tagged mcm-kui image as $(DOCKER_URI)"
	@echo "Pushing mcm-kui image to $(DOCKER_URI)..."
	$(SELF) docker:push
else
	$(SELF) docker:tag-arch
	@echo "Tagged mcm-kui image as $(DOCKER_ARCH_URI)"
	@echo "Pushing mcm-kui image to $(DOCKER_ARCH_URI)..."
	$(SELF) docker:push-arch
endif

.PHONY: run
run:
	$(MAKE) -C tests run DOCKER_IMAGE_AND_TAG=$(DOCKER_IMAGE_AND_TAG)

.PHONY: run-all-tests
run-all-tests:
ifeq ($(TEST_LOCAL), true)
	$(SELF) run > /dev/null
	$(MAKE) -C tests setup-dependencies
	$(MAKE) -C tests run-all-tests
else
	@echo Tests are disabled, export TEST_LOCAL="true" to run tests.
endif

.PHONY: dust-template
dust-template:
	node proxy/scripts/generate-template.js

.PHONY: update-plugins
update-plugins: download-plugins
	$(MAKE) -C client client-update-plugins
	$(MAKE) -C proxy proxy-update-plugins

.PHONY: update-kui
update-kui: 
	$(MAKE) -C client update-client
	$(MAKE) -C proxy update-proxy

.PHONY: awsom
awsom:
	@bash scripts/awsom-script.sh

.PHONY: test-module
test-module:
	sed -i "s/git@github.com:/https:\/\/$(GITHUB_USER):$(GITHUB_TOKEN)@github.com\//" .gitmodules
	git submodule update --init --recursive
