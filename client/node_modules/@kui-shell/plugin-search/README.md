# search-kui-plugin
Adds MCM Search capabilities to [MCM KUI](https://github.ibm.com/IBMPrivateCloud/mcm-kui).

## Development
Clone the [KUI repository](https://github.com/IBM/kui) and follow developer set-up directions from that repo.

Set SEARCH_API and accessToken in src/lib/shared/config.ts. To get an access token login to your env using: `cloudctl login -a https://<cluster URL>:8443`. Then run `cloudctl tokens` and copy the access token, everything after `Bearer`.

To activate this plugin, copy this repository into the `plugins/` directory in the top-level of the [KUI repository](https://github.com/IBM/kui).  It's a KUI requirement that individual plugin directories be named with the `plugin-` prefix (in this case:  `plugin-search`).

Execute `npm install`

Execute `npm run compile` at the root-level of the KUI repo.

Execute `npm run start` at the root-level of the KUI repo.  The desktop/electron instance of KUI should launch. (Update this later for steps for MCM KUI testing).

Try `search` commands. Ex: `search kind:pod`

## Trigger a release
To trigger a new release you must push a commit of type `fix` or `release`
```
npm run commit
```