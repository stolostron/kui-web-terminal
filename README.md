# kui-web-terminal
[![Build Status](https://travis-ci.com/open-cluster-management/kui-web-terminal.svg?token=XE6GVz1S58Uhs2nyhnqs&branch=master)](https://travis-ci.com/open-cluster-management/kui-web-terminal)

Docker image for the KUI UI and proxy to be used in Visual Web Terminal

---
<!-- temporary innocuous change to test PR build -->
## Directory Structure
_Does not include every file and directory; just important pieces_
```
root
├── build
│   ├── Build scripts that are used in the .travs.yml
├── client
│   └── client-default
│         └── config.d (the custom configuration settings for RHACM integration)
|         └── i18n (the globalized strings for the getting started feature; legacy)
|         └── icons
|         └── images
|         └── index.js (legacy; not used)
|         └── package.json
│   └── fonts (Red Hat fonts)
│   └── packages (required by upstream client side/webpack build)
│   └── plugins (source code for plugins)
│   └── src (entrypoint files for the UI)
│   └── styles (our custom css styling written in SASS/SCSS)
│   └── package.json/package-lock.json
│   └── tsconfig.json (TypeScript compiler settings)
│   └── webpack.config.js (Webpack settings)
├── proxy
│   └── app
│   └── client-default (should be identical to /client/client-default)
│   └── packages
│   └── plugins (required by KUI builder; not used)
│   └── eslintrc.js/Makefile/package.json/package-lock.json
│   └── scripts
│        └── generate-template.js (parses the upstream KUI HTML template and appends the     configurations required to render the RHACM header; generates a DustJS template in `proxy/app/views`)
├── tests (the mcm-kui-tests git submodule)
├── downloads (CLI binaries downloaded from `download-clis.sh` will be stored here)
├── plugin-downloads (KUI plugins downloaded from `download-plugins.sh` will be stored here)
├── scripts
│   └── awsom-package-json.js/awsom-script.sh/ssl.sh (legacy, not used)
│   └── move-headless.sh (used in docker build to move generated headless files to a `tmp` folder)
├── ossc (legacy)
```

---

## IMPORTANT: Before you try to build locally
In order to build the kui-web-terminal image locally, you must be running on a Linux OS.  If building on a non-Linux environment, the node-pty-prebuilt-multiarch will pull the modules associated with your non-Linux OS; this will lead to failure when the code tries to run in the Linux container.'

If you are using a non-Linux OS; we recommend that you make any desired changes to this repo and submit a PR.  After a PR is submitted, a Travis CI job will initiate that will build a kui-web-terminal docker image (check the Travis build logs; out of convenience we also tag a second image with the name associated to your git configuration; e.g. JohnSmith).

### Dependencies
- Install gtar
- Install jq
- Install NodeJS (v10.15.x or higher)

### Environment Variables
```
export GITHUB_USER=your-user-name
export GITHUB_TOKEN=myGithubToken
```

---

## How to build

_The .travis.yml is always a good place to reference the build steps._

### Prerequisites:
Before building images, you will need to download all executables and plugins:
```
make init
make download-clis
make download-plugins
```

### To build the complete kui-web-terminal image
1. Install dependencies for both client and proxy
```
make install
```
2. Build the UI _webpack_ bundles
```
make webpack
```
3. Build the proxy
```
make headless
```
4. Wrap the UI and proxy into a docker image
```
make build-image
```


### To build the client part only

1. Install the for client (NOTE: Prerequisite plugins not installed for you)
```
make install-client
```
2. build the UI _webpack_ bundles
```
make webpack
```

### To build the proxy part only

1. Install the proxy (NOTE: Prerequisite plugins not installed for you)
```
make install-proxy
```
2. Build the _proxy_
```
make headless
```

### To build the image
```
make build-image
```

### To clean your local build environment

1. Clean client dependencies
```
make clean-client
```
2. Clean proxy dependencies
```
make clean-proxy
```
3. Clean both client and proxy dependencies
```
make clean-kui
```

---

## How to integrate/update plugins (LEGACY)
1. Make sure you have a GitHub release asset .tgz file. (e.g. https://github.com/open-cluster-management/plugin-kui-addons/releases)
2. In the `download-plugins.sh` script, add a line to download your plugin:
```
download "github-repo-name" "release-tgz-filename" "release-version"
```
3. You will need to update the Makefile in the `client/` and `proxy/` directories, to uninstall and reinstall your plugin.  Find the `client-update-plugins` or `proxy-update-plugins` command. If your plugin does not need to run on the KUI proxy, then do not update the `proxy/Makefile` (e.g. search plugin).
4. In the root directory, run `make update-plugins`.  You will run this command each time you need to update your plugin version in the `download-plugins.sh` script.
5. Commit the `download-plugins.sh` and the `package-lock.json` in the `client/` and `proxy/` directories.  Failure to update the `package-lock.json` files will result in integrity check failures.

## How to integrate/update plugins (NEW)
_We only support client/front-end KUI plugins_
1. Add the source code KUI plugin to `/client/plugins`
2. Declare the new plugin as a dependency in the package.json in the following format:  `"@kui-shell/<YOUR PLUGIN NAME>": "file:plugins/<YOUR PLUGIN NAME>"`
3. Update the `client/tsconfig.json` `references` key to add the path to the plugin folder:  `{ "path": "<PATH TO YOUR PLUGIN>" }`
4. Run `make install-client` to update the package-lock.json with the new plugin dependency.

---

## How to deploy your kui-web-terminal image to OpenShift
1. Run the RHACM installer; see https://github.com/open-cluster-management/deploy.  This will install several dependencies kui-web-terminal has including management-ingress and cert-manager; it will also install the chosen SNAPSHOT image of kui-web-terminal.
2. Edit the kui-web-terminal deployment (`oc edit deployment kui-web-terminal -n open-cluster-management`); and update the container image to your built image.
3. Wait for Kubernetes to restart the pod (`oc get pod -n open-cluster-management -l app=kui-web-terminal`) and come back to Ready status.
4. Visit the Visual Web Terminal page in RHACM to view your changes (https://<YOUR RHACM URL HERE>/kui)

## How to run image locally
1. `oc login` to your OpenShift cluster; we will use the kube token from this login to create the `acm-access-token-cookie` to fetch the RHACM header and perform the `oc login` in the terminal session.
2. If you don't already have the test submodule, initialize and fetch the automated tests repo by running `git submodule update --init --recursive`.  The docker run make target in step 4 has a dependency on the test submodule Makefile.
3. Follow the steps in [mcm-kui-tests](https://github.com/open-cluster-management/mcm-kui-tests#how-to-run-nightwatch-tests) to set up env vars:
```
export K8S_CLUSTER_MASTER_IP=https://your.cluster.ip:port
export K8S_CLUSTER_USER=your-username
export K8S_CLUSTER_PASSWORD=your-password
```
4. `make run DOCKER_IMAGE_AND_TAG=<your kui-web-terminal image name (e.g. quay.io/open-cluster-management/kui-web-terminal:1.0.0)>`

---

## How to debug kui-web-terminal
Proxy/Server:
- Add an environment variable to the container:  `DEBUG='*'`
Client/UI (from the VWT page):
- Browser developer tools > Application tab > Local Storage > Add `debug='*'`'.  View logs in Browser developer tools > Console tab.
- Browser developer tools > Network tab > Filter requests by WebSocket/WS > Click the request in the table > Click Messages tab

---

## How to upgrade the upstream KUI node module dependencies OR upgrade to a newer IBM (upstream) KUI
1. Run `make clean-kui`
2. Run `make download-plugins`
3. Run `make update-kui KUI_UPDATE_VERSION=x.x.x`
4. Wait for the client and proxy dependencies to finish installing.
5. Commit the package.json and package-lock.json in both `/client` and `/proxy`

---

## How to update for security vulnerabilities
1. Change to the `/client` or `/proxy` subdirectory
2. Run `npm audit --production` to see the list of vulnerabilities, dependency chain, advisory info, etc.
3. Run `npm audit fix` to automatically fix issues.  Some issues might require you to manually
make changes to your **dependencies** or get the [IBM KUI](https://github.com/IBM/kui) team to make changes to their files to
pull in new versions of packages.  
4. Commit the package.json and package-lock.json in both `/client` and `/proxy`

NOTE: More info at https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities#security-vulnerabilities-found-with-suggested-updates



---

## How to run kui-web-terminal tests

1. If you don't already have the test submodule, initialize and fetch the automated tests repo by running `git submodule update --init --recursive`
2. `cd tests`
3. Follow the steps in [mcm-kui-tests](https://github.com/open-cluster-management/mcm-kui-tests).
4. To update the test submodule on a branch with latest tests from [mcm-kui-tests](https://github.com/open-cluster-management/mcm-kui-tests)
   - run `git submodule update --remote tests` update with the latest commit SHA from the test repo
   - commit the changes

---

## Makefile Commands

### Root
| Command                 |    Description  |
| ---------------         | --------------- |
| build-image             |    Builds the kui-web-terminal docker image. |
| clean-client            |    Removes the /build, /kui-webpack-tmp, and /node_modules in the /client directory. |
| clean-downloads         |    Removes the /downloads and /plugin-downloads directories. |
| clean-kui               |    Runs the commands for clean-client, clean-proxy, and clean-downloads. |
| clean-proxy             |    Removes the tmp directory in root and the build and node_modules directories in /proxy. |
| download-clis           |    Downloads the CLI binaries to the /downloads directory. |
| download-plugins        |    Downloads the plugin packages to the /plugin-downloads directory. |
| dust-template           |    Generates the Dust template that renders the kui-web-terminal UI. |
| headless                |    Builds the open-source KUI proxy component. |
| install                 |    Downloads plugin dependencies and npm installs /client and /proxy dependencies. |
| install-client          |    Installs the /client package.json npm packages. |
| install-proxy           |    Installs the /proxy package.json npm packages. |
| lint                    |    Runs linting on the /proxy directory. |
| lint-proxy              |    Runs linting on the /proxy directory. |
| run                     |    Runs the proxy image. |
| run-all-tests           |    Runs the Nightwatch tests from the mcm-kui-tests repo. |
| update-kui              |    Updates the open-source KUI dependencies based on KUI_UPDATE_VERSION, KUBEUI_UPDATE_VERSION variable. |
| update-plugins          |    Updates the /client and /proxy package.json plugin packages. Should run 'make download-plugins' first. |
| webpack                 |    Builds the open-source KUI webpack component. |

### Client
| Command                 |    Description  |
| ---------------         | --------------- |
| clean-client            |    Removes the /build, /kui-webpack-tmp, and /node_modules in the /client directory. |
| client-update-plugins   |    Updates the /client package.json plugin packages. Should run 'make download-plugins' first. |
| compile-css             |    Compiles the internal SCSS files into CSS. |
| install-client          |    Installs the /client package.json npm packages. |
| update-client           |    Updates the /client KUI dependencies based on KUI_UPDATE_VERSION, KUBEUI_UPDATE_VERSION variable. |
| webpack                 |    Builds the open-source KUI webpack component. |

### Proxy
| Command                 |    Description  |
| ---------------         | --------------- |
| clean-proxy             |    Removes the build and node_modules directories in /proxy. |
| headless                |    Builds the open-source KUI proxy component. |
| install-proxy           |    Installs the /proxy package.json npm packages. |
| lint-proxy              |    Runs linting on the /proxy directory. |
| proxy-update-plugins    |    Updates the /proxy package.json plugin packages. Should run 'make download-plugins' first. |
| update-proxy            |    Updates the /proxy KUI dependencies based on KUI_UPDATE_VERSION variable. |
