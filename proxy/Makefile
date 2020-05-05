.PHONY: install-proxy
install-proxy: 
	npm install

.PHONY: headless
headless: 
	QUIET=true NO_ZIPS=true npx kui-build-headless 

.PHONY: lint-proxy
lint-proxy:
	npm run lint

.PHONY: clean-proxy
clean-proxy:
	rm -rf build
	rm -rf node_modules

.PHONY: update-proxy
update-proxy:
ifdef KUI_UPDATE_VERSION
	npm uninstall @kui-shell/builder
	npm uninstall @kui-shell/core
	npm uninstall @kui-shell/react
	npm uninstall @kui-shell/plugin-bash-like
	npm uninstall @kui-shell/plugin-core-support
	npm uninstall @kui-shell/plugin-kubectl
	npm install @kui-shell/builder@${KUI_UPDATE_VERSION}
	npm install @kui-shell/core@${KUI_UPDATE_VERSION}
	npm install @kui-shell/react@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-bash-like@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-core-support@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-kubectl@${KUI_UPDATE_VERSION}
endif
	npm install

.PHONY: proxy-update-plugins
proxy-update-plugins:
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz