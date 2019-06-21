TEMP_FOLDER ?= 'tmp' # a temperary folder for headless build

.PHONY: install
install: 
	$(MAKE) -C proxy $@

.PHONY: headless
headless:
	$(MAKE) -C proxy $@
	@bash scripts/move-headless.sh $(TEMP_FOLDER)

.PHONY: image
image: headless 
	docker build -t kui-proxy .

.PHONY: clean
clean:
	rm -rf $(TEMP_FOLDER)
	$(MAKE) -C proxy $@



