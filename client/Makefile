.PHONY: install-client
install-client:
	# need to create package-lock file if not found, so use install, not ci
	npm install

.PHONY: update-client
update-client:
ifdef KUI_UPDATE_VERSION
	npm uninstall @kui-shell/builder
	npm uninstall @kui-shell/core
	npm uninstall @kui-shell/react
	npm uninstall @kui-shell/plugin-bash-like
	npm uninstall @kui-shell/plugin-client-common
	npm uninstall @kui-shell/plugin-core-support
	npm uninstall @kui-shell/plugin-proxy-support
	npm uninstall @kui-shell/plugin-carbon-themes
	# npm uninstall @kui-shell/plugin-wskflow
	# npm uninstall @kui-shell/plugin-patternfly4-themes
	npm uninstall @kui-shell/proxy
	npm uninstall @kui-shell/plugin-kubectl
	npm install --save-dev @kui-shell/builder@${KUI_UPDATE_VERSION}
	npm install @kui-shell/core@${KUI_UPDATE_VERSION}
	npm install @kui-shell/react@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-bash-like@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-client-common@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-core-support@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-proxy-support@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-carbon-themes@${KUI_UPDATE_VERSION}
	# npm install @kui-shell/plugin-patternfly4-themes@${KUI_UPDATE_VERSION}
	npm install --save-dev @kui-shell/proxy@${KUI_UPDATE_VERSION}
	npm install @kui-shell/plugin-kubectl@${KUI_UPDATE_VERSION}
	# npm install @kui-shell/plugin-wskflow@${KUI_UPDATE_VERSION}
endif
	npm ci

.PHONY: compile-css
compile-css:
	npm run build:css

.PHONY: webpack
webpack: compile-css
	npm run build

.PHONY: clean-client
clean-client:
	rm -rf build
	rm -rf kui-webpack-tmp
	# Must cleanup node_modules AND package-lock.json or dependencies could get corrupt
	rm -rf node_modules
	-rm package-lock.json

.PHONY: client-update-plugins
client-update-plugins:
	npm uninstall @kui-shell/plugin-search
	npm install ../plugin-downloads/plugin-search.tgz
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz
