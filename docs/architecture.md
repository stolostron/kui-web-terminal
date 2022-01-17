# Current Architecture

[swimlane](https://swimlanes.io/#pVRNb9swDL3rV/DUJgFsoT0aww7LDi2GYsXSrcdZVrhYsy15EtVs/36U4qTpkBYtZsCARfPrvUeKDPVYwTcTourhHhu4Qz8YywchxPcKFouLErbYBKc7JAj8xhF+OA+odAsWt0CqWSyEWPYGLcGVCwTFe1ihf0APN8pYuPVOYwgVtERjgPr28+oOJP5GDeeNCu1RATeiPa+FOBGesi6dJTahr0B7VISggHAYIQb2nkWzlq0bcP6aBLXT0LuNsTVsDbVArkML7J5zefwVkaFo5zqDMFN6KJROaYrsWOx+zOHZUp++XsMqNuMe/HLXcDiYYGbdGsuf4cg2z9ym0F1PLU5A15DAbSaALxa9P7B5pey6z2Q5G8hHzer5HmqZWJeRM17UcDYhr9P5ss4NPArCkRY1GWdLCKQ8QW8CoTV2w3EnHYWwjrASJ3sBExLHQ+p7z0OG6p0jGNP0hZCrLZmcyfv6w43sojkPMPaRFStS/0VvOiyF+IisaM8ECzH2qAIz1qLuMnfOLg9tzZjbaPNnyplnsZJMKbWxKbUb5FRGNr1r5KAYppe7gkH+W1gGr+VIf2TIQpQUhHiqOLx7UY/U1RF9Z8eDkQlRMJrxeaWP9q3ivbTrpEijGPhj0v8R++lGvwXLdHFclvAl2jwoTO7A7oHviVcmTYD2YftdlB41mgc82NeK1BtITxdOpEM4C8bPXw==)

## Client & Proxy
[Client](https://github.com/stolostron/kui-web-terminal/tree/master/client) is the front-end code.
[Proxy](https://github.com/stolostron/kui-web-terminal/tree/master/proxy) is the server. 

We don't have code on client side, we run kui directly.

We have some code on server side for user login & setups.

Both contains complete functional KUI process.

KUI process will be able to execute corresponding plugins for each command base on the prefix of the command. (first string, second string,...)

## Important Plugins
- [plugin-bash-like](https://github.com/kubernetes-sigs/kui/tree/master/plugins/plugin-bash-like): plugin for websocket connection
  - will pass command to server side
  - has `exec` and `request`, if `request` will let server's kui handle, if `exec` will directly run command
  - on <=6.0.x, it will add visualization for all commands (parse & add tables)
  - on >7.0.x, visualization are disabled
  - support interactive commands like `vi` (because of using websocket)
- [plugin-kubectl](https://github.com/kubernetes-sigs/kui/tree/master/plugins/plugin-kubectl): plugin for kubectl
  - installed on both server & client
  - client side just simply a wrap of server side
  - server side will be named as `_kubectl`
  - server side will run command & do visualization
- [plugin-kui-addons](https://github.com/stolostron/plugin-kui-addons): blocks invalid kui commands 
  - installed on both server & client
  - used to override some kui commands, after 8.0.x, may be we can get rid of it
- [plugin-search](https://github.com/stolostron/search-kui-plugin): 
  - installed only on client side
  - inject to kui's page for customized input bar & tokens
- [configs](https://github.com/stolostron/kui-web-terminal/tree/master/client/client-default): all configs
  - [about](https://github.com/stolostron/kui-web-terminal/blob/master/client/client-default/config.d/about.json)
  - [name](https://github.com/stolostron/kui-web-terminal/blob/master/client/client-default/config.d/name.json)
  - [proxy settings](https://github.com/stolostron/kui-web-terminal/blob/master/client/client-default/config.d/proxy.json)
- [plugin carbon themes](https://github.com/kubernetes-sigs/kui/tree/master/plugins/plugin-carbon-themes)
  - IBM carbon themes we are using

## User Login Flow

When user open a kui page, the following will happen:
1. client send a request `POST /exec` to kui server
2. kui server (root user) do the following:
   - create a non-root user with uid/gid & home directory
   - login user with `oc login --token` by using `acm-access-token-cookie` in cookie
   - create kui-subprocess (node.js process), which is a node js session with uid/gid & env set
   - construct a url for websocket connection
   - update current server (main process) to support websocket for a new websocket url
   - connect websocket server with kui-subprocess
   - reply the url of websocket

     https://github.com/stolostron/kui-web-terminal/blob/master/proxy/app/routes/exec.js
3. client connect websocket, and show ready
4. when websocket is closed, child process will be closed. Details: [stdio-channel.ts](https://github.com/kubernetes-sigs/kui/blob/master/plugins/plugin-bash-like/src/pty/stdio-channel.ts)

## User Command Flow
- If a command only requires front-end plugin (search), will be executed in front-end.

- If a command needs back-end kui plugin support (kubectl), will go through bash-like plugin, and run on back-end's kui sub-process.
   - the plugin will able to execute the command in back-end, so they can do anything. We have to be careful.

- Other commands (vi,echo,...) which are not supported by any plugins, will be executed through bash-like plugin. 
   - use node-pty to execute a command
   - each command is a new bash session
   - each command will reload bashrc & bash_profile
   - command will be executed in rbash 


## rbash
- in v8, we have to set up in [config.d/proxy.json](https://github.com/stolostron/kui-web-terminal/blob/master/client/client-default/config.d/proxy.json) as default shell in oss KUI is `/bin/bash`
- in v6, we set env var `SHELL=/bin/rbash`
- only allow user to execute commands in /usr/local/bin

   https://github.com/stolostron/kui-web-terminal/blob/master/Dockerfile#L127-L153
- each user (user inside container) create files with permission 700, so other users will not able to access those files
- used rbash to disable bash-builtin commands

    https://github.com/stolostron/kui-web-terminal/blob/master/Dockerfile#L115-L125

## Scalability
Issue: https://github.com/stolostron/backlog/issues/564
### Auto Scale (Not Supported)
KUI has an https request before websocket connection, so it's not easy to scale. 
(e.g. We have a https request & websocket connection, if these two requests doesn't go to the same pod, kui will not work.)

ICP ingress doesn't support sticky session, so we will not support HPA.

### Performance of Single Pod
Because each tab will trigger a creation of KUI subprocess, which is node.js process, which takes at least 10MB. A user open 30 tabs in KUI will makes us hit our memory limit.

`kubectl`/`helm` commands are pretty cpu intensive, and we have tested with sending 10 concurrent `kubectl get po` every 10 seconds, we will hit our cpu limits, and kui will drop/timeout some of the commands if we increase the number of concurrent commands we send.


## Others
### Hacks for header
We want to render header, but before v8, kui's html is generated inside kui's npm package.

Used a script to modify the kui's html page to allow us inject header & other logic:
https://github.com/stolostron/kui-web-terminal/blob/master/proxy/scripts/generate-template.js

We are still using it for v8, but it's possible that we can refactor it.

## Limitations
- kui has weird design of plugin convention (same code to run on both client & server)
- we don't have control of front-end code (all inside oss kui)
  - we do have some css override
- we don't have control of websocket connection (all inside bash-like plugin)
- server side requires kui process (for k8s plugin), so server has to be a node.js env
- current kui has terrible performance
  - one tab = one websocket connection = one node.js process = 10+MB memory
  - `kubectl` commands can be very cpu consuming. According to some tests, currently we can at most support 10 concurrent clients sending `kubectl` requests (as we have 300m cpu limits)
  - hard to scale: current architecture has websocket & user home folder (stateful), so need sticky session if we are doing horizontal scaling.
- non-persistent home folder
  - every time a websocket is closed we remove home folder
- potential security problems
  - rbash is easy to hack
  - we are using root account
- breaking changes of oss kui
  - every time we update kui(even minor version updates), our integration will break
- everything is build time
  - oss kui plugin model requires `npm install`/`npm uninstall` not possible to enable/disable at runtime
  - build time (before we build downstream container) so it cannot be very user specific
- hard to create a plugin
  - oss kui needs more docs
  - oss kui didn't design APIs well (they expect every plugin to be self contained at first, now they start to have reusable tables/sidecar, but still missing many functions & docs)
- hard to do development
  - without a fork, if there is any bug of oss kui, we have to debug in npm packages, which happens a lot.
