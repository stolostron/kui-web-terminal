.PHONY: install-proxy
install-proxy: 
	npm install

.PHONY: compile
compile:
	npx kui-compile

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
	npm uninstall @kui-shell/builder
	npm uninstall @kui-shell/core
	npm uninstall @kui-shell/plugin-k8s
	npm uninstall @kui-shell/plugin-bash-like
	npm install --save-dev @kui-shell/builder@dev
	npm install --save @kui-shell/core@dev
	npm install --save @kui-shell/plugin-k8s@dev
	npm install --save @kui-shell/plugin-bash-like@dev
	npm install

.PHONY: proxy-update-plugins
proxy-update-plugins:
	npm uninstall @kui-shell/plugin-kui-addons
	npm install ../plugin-downloads/plugin-kui-addons.tgz