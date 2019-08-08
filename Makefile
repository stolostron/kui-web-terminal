
GIT_REMOTE_URL = $(shell git config --get remote.origin.url)
GITHUB_USER ?= $(ARTIFACTORY_USER)
GITHUB_USER := $(shell echo $(GITHUB_USER) | sed 's/@/%40/g')
GITHUB_TOKEN ?= 


DOCKER_EDGE_REGISTRY ?= hyc-cloud-private-edge-docker-local.artifactory.swg-devops.com
DOCKER_SCRATCH_REGISTRY ?= hyc-cloud-private-scratch-docker-local.artifactory.swg-devops.com
DOCKER_INTEGRATION_REGISTRY ?= hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com

WORKING_CHANGES = $(shell git status --porcelain)
BUILD_DATE = $(shell date +%m/%d@%H:%M:%S)
GIT_COMMIT = $(shell git rev-parse --short HEAD)
VCS_REF = $(if $(WORKING_CHANGES),$(GIT_COMMIT)-$(BUILD_DATE),$(GIT_COMMIT))
IMAGE_DESCRIPTION = IBM Cloud Private MCM-KUI


DOCKER_USER ?= $(ARTIFACTORY_USER)
DOCKER_PASS ?= $(ARTIFACTORY_TOKEN)

DOCKER_IMAGE ?= mcm-kui-proxy
DOCKER_TAG ?= $(shell whoami)

DOCKER_RUN_OPTS ?= -e NODE_ENV=development -e ICP_EXTERNAL_URL=$(ICP_EXTERNAL_URL) -e KUI_INGRESS_PATH="kui" -e AUTH_TOKEN=$(AUTH_TOKEN) -e DEBUG=* -e INSECURE_MODE=true -d
DOCKER_BIND_PORT ?= 8081:3000

# Default to scratch unless a push to master
PUSH_INTEGRATION ?= false
DOCKER_REGISTRY := $(DOCKER_SCRATCH_REGISTRY)
DOCKER_NAMESPACE := mcm-kui-pr-builds
ifeq ($(PUSH_INTEGRATION), true)
	DOCKER_REGISTRY := $(DOCKER_INTEGRATION_REGISTRY)
	DOCKER_NAMESPACE := ibmcom
endif



ARCH := $(shell uname -m)
OS ?= $(shell uname -r | cut -d '.' -f6)


ifeq ($(ARCH), x86_64)
	ARCH = amd64
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
ifndef ARTIFACTORY_TOKEN 
	$(info ARTIFACTORY_TOKEN not defined)
	exit -1
endif

-include $(shell curl -so .build-harness -H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.v3.raw" "https://raw.github.ibm.com/ICP-DevOps/build-harness/master/templates/Makefile.build-harness"; echo .build-harness)



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
DOCKER_BUILD_OPTS = --build-arg "VCS_REF=$(VCS_REF)" --build-arg "VCS_URL=$(GIT_REMOTE_URL)" --build-arg "IMAGE_NAME=$(DOCKER_IMAGE_ARCH)" --build-arg "IMAGE_DESCRIPTION=$(IMAGE_DESCRIPTION)" --build-arg "ARCH=$(ARCH)"

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

.PHONY: compile-client
compile-client:
	$(MAKE) -C proxy $@

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
	rm -rf downloads
	rm -rf plugin-downloads

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

.PHONY: build-image
build-image: docker-login-edge
	@echo "Building mcm-kui image"
	$(SELF) docker:build

# Push docker image to artifactory
.PHONY: release
release:
	$(SELF) docker:tag-arch
	@echo "Tagged mcm-kui image as $(DOCKER_ARCH_URI)"
	@echo "Pushing mcm-kui image to $(DOCKER_ARCH_URI)..."
	$(SELF) docker:push-arch

.PHONY: run
run:
	$(SELF) docker:run

.PHONY: tests-dev
tests-dev: run
	$(MAKE) -C client client-tests

.PHONY: dust-template
dust-template:
	node proxy/scripts/generate-template.js

.PHONY: update-plugins
update-plugins: download-plugins
	$(MAKE) -C client client-update-plugins
	