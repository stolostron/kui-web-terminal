# kui-proxy
Docker image for the KUI UI and proxy to be used in ICP

## How to Build

1. install dependencies
```
make install
```
2. wrap into a docker image
```
make image
```
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




