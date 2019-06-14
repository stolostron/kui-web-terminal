.PHONY: install
install: 
	npm install

.PHONY: compile
compile:
	npx kui-compile

.PHONY: headless
headless: compile
	QUIET=true NO_ZIPS=true npx kui-build-headless 

.PHONY: image
image:
	docker build -t kui-proxy .

.PHONY: clean
clean:
	rm -r build
	rm -r node_modules


