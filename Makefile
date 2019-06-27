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


.PHONY: install
install: 
	$(MAKE) -C proxy $@

.PHONY: headless
headless:
	$(MAKE) -C proxy $@
	@bash scripts/move-headless.sh $(TEMP_FOLDER)

.PHONY: addcli
addcli: init
	@make docker:login
	@./build/download-clis.sh

.PHONY: image
image: headless 
	docker build $(DOCKER_BUILD_OPTS) -t kui-proxy . 

.PHONY: clean
clean:
	rm -rf $(TEMP_FOLDER)
	$(MAKE) -C proxy $@
