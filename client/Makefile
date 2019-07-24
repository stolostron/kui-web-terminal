.PHONY: install-client
install-client: 
	npm install

.PHONY: compile-client
compile-client: 
	npx kui-compile

.PHONY: webpack
webpack: 
	WEB_COMPRESS=none npx kui-build-webpack

.PHONY: clean-client
clean-client:
	rm -rf build
	rm -rf kui-webpack-tmp
	rm -rf node_modules