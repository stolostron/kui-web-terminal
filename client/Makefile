KUI_UPDATE_VERSION ?= dev

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
	npm install --save-dev @kui-shell/builder@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/core@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-k8s@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-bash-like@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-core-support@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-proxy-support@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/plugin-editor@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/proxy@${KUI_UPDATE_VERSION}
	npm install --save @kui-shell/webpack@${KUI_UPDATE_VERSION}
	npm install

.PHONY: compile-client
compile-client: 
	npx kui-compile

.PHONY: import-css
import-css:
	@bash scripts/import-css.sh

.PHONY: compile-css
compile-css:
	npm run build:css

.PHONY: fix-webpack-path
fix-webpack-path:
	@echo Adding public path to webpack config file:
	sed -i'.bak' "s/publicPath: '\/'/publicPath: '\/kui\/'/g" node_modules/@kui-shell/webpack/webpack.config.js 
	diff node_modules/@kui-shell/webpack/webpack.config.js   node_modules/@kui-shell/webpack/webpack.config.js.bak || echo '      ^ finished replacing publicPath in webpack.config.js'

.PHONY: webpack
webpack: compile-css fix-webpack-path
	WEB_COMPRESS=gzip npx kui-build-webpack

.PHONY: clean-client
clean-client:
	rm -rf build
	rm -rf kui-webpack-tmp
	rm -rf node_modules

.PHONY: client-tests
client-tests:
	if [ ! -d "test-output" ]; then \
		mkdir test-output; \
	fi
	npm run test:e2e
	
.PHONY: client-update-plugins
client-update-plugins:
	npm uninstall @kui-shell/plugin-search
	npm install ../plugin-downloads/plugin-search.tgz
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz