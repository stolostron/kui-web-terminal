.PHONY: install-proxy
install-proxy: 
	npm install

.PHONY: compile
compile:
	npx kui-compile

.PHONY: headless
headless: 
	QUIET=true NO_ZIPS=true npx kui-build-headless 



.PHONY: clean-proxy
clean-proxy:
	rm -rf build
	rm -rf node_modules


