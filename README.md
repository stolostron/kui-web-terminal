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

1. install dependencies
```
make install
```
2. wrap into a docker image
```
make image
```
**Note:** you can use `make headless` to build code, and code will be in the `./tmp/` folder.

3. run the docker image
```
docker run -e DEBUG=* -p 8081:3000 kui-proxy:latest
```
**Note:** Because currently we are generating self-signed certs, please make sure you visit `https://localhost:8081/exec` on your browser, so your browser can recognize the certs.

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




