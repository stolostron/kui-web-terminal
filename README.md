# kui-proxy
[![Build Status](https://travis.ibm.com/IBMPrivateCloud/mcm-kui.svg?token=CBwKyJRuBcV6xpq9sj7x&branch=master)](https://travis.ibm.com/IBMPrivateCloud/mcm-kui)

Docker image for the KUI UI and proxy to be used in ICP

## Before you build
Building kui requires homebrew, gtar, and jq.
- Install homebrew: https://brew.sh/
- Install gtar: `brew install gnu-tar`
- Install jq: `brew install jq`

Specify some environment variables
```
export ARTIFACTORY_USER=myArtifactoryEmail
export ARTIFACTORY_TOKEN=myArtifactoryAPIKey
export GITHUB_TOKEN=myGithubToken
```

Before building images, you will need to download all executables and plugins:
```
make init
make docker-login
make download-clis
make download-plugins
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
3. wrap the UI and proxy into a docker image
```
make build-image
```

4. run the docker image
```
docker run -e DEBUG=* -e INSECURE_MODE=true -p 8081:3000 mcm-kui-proxy:latest
```
**Note:** Because currently we are generating self-signed certs, please make sure you visit `https://localhost:8081/exec` on your browser, so your browser can recognize the certs.

**Note:** You can also build the UI part and proxy part separately if you want.  

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


## How to Deploy to ICP
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

3. Use KUI by visiting `https://your.cluster.ip:8443/kui/` 

4. Login with `cloudctl login`





