# kui-web-terminal
[![Build Status](https://travis-ci.com/open-cluster-management/kui-web-terminal.svg?token=XE6GVz1S58Uhs2nyhnqs&branch=master)](https://travis-ci.com/open-cluster-management/kui-web-terminal)

Docker image for the KUI UI and proxy to be used in Visual Web Terminal

## Before you build
Building kui requires homebrew, gtar, and jq.
- Install homebrew: https://brew.sh/
- Install gtar: `brew install gnu-tar`
- Install jq: `brew install jq`

Specify some environment variables
```
export GITHUB_USER=your-user-name
export GITHUB_TOKEN=myGithubToken
```

Before building images, you will need to download all executables and plugins:
```
make init
make download-clis
make download-plugins
```
**NOTE:** Ignore the error message
```
 build/before-make.sh: Command not found
```

Make sure that you run the `download-clis.sh` script at least once before proceeding with your build.

## How to Build

1. install dependencies for both client and proxy
```
make install
```
2. build the UI _webpack_ bundles
```
make webpack
```
3. build the proxy
```
make headless
```
4. wrap the UI and proxy into a docker image
```
make build-image
```


### To build the client part only

1. install the dependencies for the client
```
make install-client
```
2. build the UI _webpack_ bundles
```
make webpack
```

### To build the proxy part only

1. install the dependencies for the proxy
```
make install-proxy
```
2. build the _proxy_
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
3. Or, to clean both at once
```
make clean-kui
```

## How to integrate/update plugins
1. Make sure you have a GitHub release asset .tgz file.
2. In the `download-plugins.sh` script, add a line to download your plugin:
```
download "github-repo-name" "release-tgz-filename" "release-version"
```

3. You will need to update the Makefile in the `client/` and `proxy/` directories, to uninstall and reinstall your plugin.  Find the `client-update-plugins` or `proxy-update-plugins` command. If your plugin does not need to run on the KUI proxy, then do not update the `proxy/Makefile`.
4. In the root directory, run `make update-plugins`.  You will run this command each time you need to update your plugin version in the `download-plugins.sh` script.
5. Commit the `download-plugins.sh` and the `package-lock.json` in the `client/` and `proxy/` directories.  Failure to update the `package-lock.json` files will result in integrity check failures.


<!-- ## How to Deploy to ICP
1. Get the latest chart and image
   - Latest chart:
   https://na.artifactory.swg-devops.com:443/artifactory/hyc-cloud-private-integration-helm-local/ibm-mcm-kui-99.99.99.tgz
   - Latest image:
   ```
    docker pull hyc-cloud-private-integration-docker-local.artifactory.swg-devops.com/ibmcom/mcm-kui-proxy-amd64:latest
   ```

2. Install the chart

   Following values have to be customized:
   - **proxy.clusterIP:** ip address/domain name for your cluster
   - **proxy.clusterPort:** icp-management-ingress port of your cluster
   - **proxy.image.repository:** image path
   - **proxy.image.tag:** image tag

   ```
    helm install --set proxy.clusterIP=your.icp.ip,proxy.clusterPort=8443 --name mcm-kui --namespace default ibm-mcm-kui-99.99.99.tgz --tls
   ```

3. Use KUI by visiting `https://your.cluster.ip:port/kui`

4. Login with `cloudctl login` -->

## How to Run Image Locally
1. If you don't already have the test submodule, initialize and fetch the automated tests repo by running `git submodule update --init --recursive`
2. Follow the steps in [mcm-kui-tests](https://github.com/open-cluster-management/mcm-kui-tests#how-to-run-nightwatch-tests) to set up env vars:
```
export K8S_CLUSTER_MASTER_IP=https://your.cluster.ip:port
export K8S_CLUSTER_USER=your-username
export K8S_CLUSTER_PASSWORD=your-password
```
3. `make run`

## How to run Nightwatch tests

1. If you don't already have the test submodule, initialize and fetch the automated tests repo by running `git submodule update --init --recursive`
2. Follow the steps in [mcm-kui-tests](https://github.com/open-cluster-management/mcm-kui-tests).

## Makefile Commands

### Root
| Command                 |    Description  |
| ---------------         | --------------- |
| awsom                   |    Runs the wicked scan and BIG-T-CSV automation tools. |
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
| fix-webpack-function    |    Redefines the webpack function to the open-source webpack configuration. |
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
