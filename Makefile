TEMP_FOLDER ?= 'tmp' # a temporary folder for headless build

ARCH ?= $(shell uname -m)
OS ?= $(shell uname -r | cut -d '.' -f6)

ifneq ($(ARCH), x86_64)
	DOCKER_FILE = Dockerfile.$(ARCH)
endif

ifeq ($(ARCH), x86_64)
	ARCH = amd64
endif

DOCKER_BUILD_OPTS = --build-arg "ARCH=$(ARCH)"

.PHONY: install-client
install-client: 
	$(MAKE) -C client $@

.PHONY: install-proxy
install-proxy: 
	$(MAKE) -C proxy $@

.PHONY: install
install: install-proxy install-client 
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

.PHONY: addcli
addcli: init
	@make docker:login
	@./build/download-clis.sh

.PHONY: image
image: headless 
	docker build $(DOCKER_BUILD_OPTS) -t kui-proxy . 

.PHONY: clean-proxy
clean-proxy:
	rm -rf $(TEMP_FOLDER)
	$(MAKE) -C proxy $@

.PHONY: clean-client
clean-client:
	$(MAKE) -C client $@

.PHONY: clean
clean: clean-client clean-proxy
	@echo Clean for both client and proxy
