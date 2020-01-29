.PHONY: install-client
install-client: 
	npm install

.PHONY: update-client
update-client:
ifdef KUI_UPDATE_VERSION
	npm uninstall @kui-shell/builder
	npm uninstall @kui-shell/core
	npm uninstall @kui-shell/plugin-bash-like
	npm uninstall @kui-shell/plugin-client-common
	npm uninstall @kui-shell/plugin-core-support
	npm uninstall @kui-shell/plugin-proxy-support
	npm uninstall @kui-shell/plugin-carbon-themes
	npm uninstall @kui-shell/plugin-editor
	npm uninstall @kui-shell/proxy
	npm uninstall @kui-shell/webpack
	npm install --save-dev @kui-shell/builder@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/core@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-bash-like@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-client-common@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-core-support@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-carbon-themes@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-proxy-support@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-editor@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/proxy@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/webpack@${KUI_UPDATE_VERSION}
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

.PHONY: compile-css
compile-css:
	npm run build:css

.PHONY: fix-webpack-function
fix-webpack-function:
	@echo Adding jsonpFunction to webpack config file:
	sed -i'.bak' "s/output: {/output: { jsonpFunction: 'webpackJsonpFunction3',/g" node_modules/@kui-shell/webpack/webpack.config.js 
	diff node_modules/@kui-shell/webpack/webpack.config.js   node_modules/@kui-shell/webpack/webpack.config.js.bak || echo '      ^ finished replacing jsonpFunction in webpack.config.js'

.PHONY: webpack
webpack: compile-css fix-webpack-function
	WEB_COMPRESS=gzip npx kui-build-webpack

.PHONY: clean-client
clean-client:
	rm -rf build
	rm -rf kui-webpack-tmp
	rm -rf node_modules
	
.PHONY: client-update-plugins
client-update-plugins:
	npm uninstall @kui-shell/plugin-search
	npm install ../plugin-downloads/plugin-search.tgz
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz
