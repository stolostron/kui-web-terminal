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
	npm uninstall @kui-shell/plugin-bash-like
	npm uninstall @kui-shell/plugin-core-support
	npm uninstall @kui-shell/plugin-editor
	npm install --save-dev @kui-shell/builder@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/core@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-bash-like@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-core-support@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-editor@${KUI_UPDATE_VERSION}
endif
ifdef KUBEUI_UPDATE_VERSION
	npm uninstall @kui-shell/plugin-kubeui
	npm uninstall @kui-shell/plugin-helmui
	npm uninstall @kui-shell/plugin-logui
	npm uninstall @kui-shell/plugin-openshift
	npm install --save @kui-shell/plugin-kubeui@${KUBEUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-helmui@${KUBEUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-logui@${KUBEUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-openshift@${KUBEUI_UPDATE_VERSION}
endif
	npm install

.PHONY: proxy-update-plugins
proxy-update-plugins:
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz