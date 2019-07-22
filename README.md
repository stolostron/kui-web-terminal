# kui-proxy
Docker image for the KUI UI and proxy to be used in ICP

## Before you build
Building kui requires homebrew, gtar, and jq.
Install homebrew: https://brew.sh/
Install gtar: `brew install gnu-tar`
Install jq: `brew install jq`

Specify some environment variables
```
export ARTIFACTORY_USER=myArtifactoryEmail
export ARTIFACTORY_KEY=myArtifactoryAPIKey
export ARTIFACTORY_URL=https://na.artifactory.swg-devops.com/artifactory/hyc-cloud-private-scratch-generic-local 
```

## How to Build

1. install dependencies for both client and proxy
```
make install
```
2. build the UI _webpack_ bundles
```
make webpack
```
3. wrap the UI and proxy into a docker image
```
make image
```
**Note:** You can use `make headless` to build code, and code will be in the `./tmp/` folder.

4. run the docker image
```
docker run -e DEBUG=* -p 8081:3000 kui-proxy:latest
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
2. build the image (but will not include webpack bundles if they have not been built)
```
make image
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
make clean
```

## How to Run without Building a Docker Image
1. go inside the proxy folder
```
cd proxy
```
2. install & compile
```
npm install
npx kui-compile
```
3. start server
```
npm start
```




