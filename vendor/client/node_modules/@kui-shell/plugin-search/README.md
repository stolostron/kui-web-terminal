# search-kui-plugin
[![Build Status](https://travis-ci.com/open-cluster-management/search-kui-plugin.svg?token=jzyyzQmWYBEu33MCMh9p&branch=master)](https://travis-ci.com/open-cluster-management/search-kui-plugin)

Adds Search capabilities to [KUI Web Terminal](https://github.com/open-container-management/kui-web-terminal).

## Development
Clone the [KUI repository](https://github.com/IBM/kui) and follow developer set-up directions from that repo.

To activate this plugin, copy this repository into the `plugins/` directory in the top-level of the [KUI repository](https://github.com/IBM/kui).  It's a KUI requirement that individual plugin directories be named with the `plugin-` prefix (in this case:  `plugin-search`).

<pre>
.
├── ...
├── package.json
├── plugins
│   ├── plugin-sample
│   └── plugin-search
|       ├── ...
|       └── tsconfig.json
├── tsconfig-es6.json
└── tsconfig.json
</pre>

1. To use the plugin within the dev environment, add then `plugin-search` path to the `dependencies` list in the `package.json` at the root level.

##### package.json

```bash
 "dependencies": {
    "@kui-shell/plugin-sample": "file:plugins/plugin-sample",
    "@kui-shell/plugin-search": "file:plugins/plugin-search",
```

2. Add plugin's reference path to the root level `tsconfig.json` & `tsconfig-es6.json` file.

##### tsconfig.json
```bash
  "references": [
    { "path": "./plugins/plugin-sample" },
    { "path": "./plugins/plugin-search" }
  ]
```

##### tsconfig-es6.json
```bash
  "references": [
    { "path": "./plugins/plugin-sample/tsconfig-es6.json" },
    { "path": "./plugins/plugin-search/tsconfig-es6.json" }
  ]
```

3. Add extends path to the`tsconfig.json` file in the `plugin-search` repo.

```bash
"extends": "../../node_modules/@kui-shell/builder/tsconfig-base.json",
```

If the extended path is missing, the user will be met with this error when compiling the code.

```bash
error TS5070: Option '--resolveJsonModule' cannot be specified without 'node' module resolution strategy.
```

4. The following variables need to be set in the `src/lib/shared/config.ts` file.

<pre>
SEARCH_API - Endpoint of the search API
CONSOLE_API - Endpoint of the CONSOLE API
SEARCH_SERVICE - Search service URL. (The value retrieved from this endpoint, is to ensure that the Search API is installed on the cluster)
</pre>

The user can set the `staticConfig` path to their own `search.json` file, and the `authConfig` path to their own `search-auth.json` file. This will set the cluster configurations for the local dev environment. A template of each file can be found in the `src/lib/shared/` directory.

```bash
staticConfig = require('path/to/file/search.json')
authConfig: AuthConfig = require('path/to/file/search-auth.json')
```
##### search.json
```bash
{
  "env": "development",
  "SEARCH_API": "https://<cluster search-api route host>/searchapi/graphql",
  "CONSOLE_API": "https://<cluster console-api route host>/hcmuiapi/graphql",
  "SEARCH_SERVICE": "https://<cluster multicloud-console route host>/multicloud/servicediscovery/search",
  "serverSideConfig": {
    "inBrowserOk": false
  }
}
```

##### search-auth.json
```bash
{
  "authorization": "Bearer <oc token>",
  "cookie": "cfc-cookie-access-token=<oc token>"
}
```

To get an access token login to your env using: `oc login --token=<cluster API Token> --server=https://<cluster URL>:6443`. The login command can be found by accessing the OCP console. After logging into the OCP console, click the top right dropdown menu and select `Copy Login Command`. The user will be redirected to display the token. Copy the command, and execute the command within the CLI. Then run `oc whoami --show-token` and copy the access token.

<pre>
authorization & cookie - User access token
</pre>

5. Install the plugin dependencies

```bash
npm install
```

6. Compile the code at the root-level of the KUI repo.

```bash
npm run compile
```

7. Execute start at the root-level of the KUI repo.  The desktop/electron instance of KUI should launch. (Update this later for steps for ACM KUI testing).

```bash
npm run start
```

Try `search` commands. Ex: `search kind:pod`

<br>
<a href="docs/readme/images/search-command.gif">
    <img alt="" src="docs/readme/images/search-command.gif"></img>
</a>

## Testing

The following will run all jest based unit tests. (Jest configurations can be specified within the `package.json` file or the `jest.config.js` file.)

```bash
npm run test:unit
```

<a href="docs/readme/images/search-command.gif">
    <img alt="" src="docs/readme/images/jest-testing.gif" width=890 height=400></img>
</a>

The following will run all nightwatch e2e tests. (Nightwatch configurations can be specified within the `nightwatch.json` file.)

```bash
npm run test:firefox
```

## NPM Commands

| Command                                | Description                                                                |
|----------------------------------------|----------------------------------------------------------------------------|
| `npm run test`                         | Run jest tests                                                             |
| `npm run test:chrome`                  | Run Nightwatch E2E testing in chrome                                       |
| `npm run test:firefox`                 | Run Nightwatch E2E testing in firefox (Default)                            |
| `npm run test:safari`                  | Run Nightwatch E2E testing in safari                                       |
| `npm run test:unit`                    | Run jest unit tests                                                        |
| `npm run test:update-snapshot`         | Run and update jest tests snapshots                                        |
| `npm run test:watch`                   | Watches jest tests                                                         |
| `npm run semantic-release`             | Uses the commit messages to determine the type of changes in the codebase  |
| `npm run commit`                       | CLI tool that helps format commit messages with a series of prompts        |
| `npm run buildCSS`                     | Compile SCSS into readable CSS                                             |
| `npm run scss`                         | Watches SCSS style changes and updates the current CSS files               |

## Trigger a release
To trigger a new release you must push a commit of type `fix` or `release`
```bash
npm run commit
```

## Links

These are a few useful links that will help provide technical reference and best practices when developing for the platform.

- [Carbon Component React](https://github.com/carbon-design-system/carbon-components-react)
- [NPM Docs](https://docs.npmjs.com)
- [React Docs](https://reactjs.org/docs/hello-world.html)
- [Jest Unit Testing](https://jestjs.io/docs/en/getting-started)
- [Nightwatch E2E Testing](https://nightwatchjs.org/guide)
