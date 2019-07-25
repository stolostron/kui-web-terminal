.PHONY: install-client
install-client: 
	npm install

.PHONY: update-client
update-client:
	npm uninstall @kui-shell/builder
	npm uninstall @kui-shell/core
	npm uninstall @kui-shell/plugin-k8s
	npm uninstall @kui-shell/plugin-bash-like
	npm uninstall @kui-shell/plugin-core-support
	npm uninstall @kui-shell/plugin-proxy-support
	npm uninstall @kui-shell/plugin-editor
	npm uninstall @kui-shell/proxy
	npm uninstall @kui-shell/webpack
	npm install --save-dev @kui-shell/builder@dev
	npm install --save @kui-shell/core@dev
	npm install --save @kui-shell/plugin-k8s@dev
	npm install --save @kui-shell/plugin-bash-like@dev
	npm install --save @kui-shell/plugin-core-support@dev
	npm install --save @kui-shell/plugin-proxy-support@dev
	npm install --save @kui-shell/plugin-editor@dev
	npm install --save @kui-shell/proxy@dev
	npm install --save @kui-shell/webpack@dev
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