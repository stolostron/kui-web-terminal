# search-kui-plugin
[![Build Status](https://travis-ci.com/open-cluster-management/search-kui-plugin.svg?token=jzyyzQmWYBEu33MCMh9p&branch=master)](https://travis-ci.com/open-cluster-management/search-kui-plugin)

Adds Search capabilities to [KUI Web Terminal](https://github.com/open-cluster-management/kui-web-terminal).


## Development
Setup development environment with automated script.

1. Clone this repo.
2. `oc login ...` to your development cluster.
3. `npm run setup-dev`
4. `npm run start`

<details><summary>Setup Development environment manually</summary>
<p>

Clone the [Plugin Kubectl Boilerplate](https://github.com/kui-shell/plugin-kubectl-boilerplate) repository.
  *IMPORTANT- be sure to checkout commit `-2374814`, which is representative of the KUI client at version 6.0.13.  The search plugin is not yet compatible with any version greater than 6.0.13.

<pre>
git clone git@github.com:kui-shell/plugin-kubectl-boilerplate.git
cd plugin-kubectl-boilerplate/
git checkout -b &lt;dev_branch_name&gt; 2374814c0b737d0e84f34c2005a7af5ea5f942d7
</pre>

To activate this plugin, copy this repository into the `plugins/` directory in the top-level of the [Plugin Kubectl Boilerplate](https://github.com/kui-shell/plugin-kubectl-boilerplate) repo.  It's a KUI requirement that individual plugin directories be named with the `plugin-` prefix (in this case:  `plugin-search`).

<pre>
.
├── ...
├── package.json
├── plugins
│   ├── plugin-sample
│   └── plugin-search
│      ├── ...
│      └── tsconfig.json
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

3. Add extends path to the `tsconfig.json` file in the `plugin-search` repo.

```bash
"extends": "../../node_modules/@kui-shell/builder/tsconfig-base.json",
```

If the extended path is missing, the user will be met with this error when compiling the code.

```bash
error TS5070: Option '--resolveJsonModule' cannot be specified without 'node' module resolution strategy.
```

4. Update `style.json` file within `plugins/plugin-kubeui-client/config.d/` to include "kui--bottom-input" value for "bodyCss" key:
```bash
{
  "defaultTheme": "Dark",
  "bodyCss": ["kui kui--bottom-input"],
  "tableStyle": "Light",
  "promptPlaceholder": "",
  "topTabs": {
    "names": "command"
    }
}
```

4. The following routes need to be created within the cluster, in order for the API request calls to be executed successfully.

| Name           | Service                        | Node Port | TLS Termination | Insecure Traffic |
|----------------|--------------------------------|-----------|-----------------|------------------|
| searchapi      | search-search-api              | 4010      | Passthrough     | Redirect         |
| consoleapi     | console-chart-xxxxx-consoleapi | 4000      | Passthrough     | Redirect         |

5. The following variables need to be set in the `src/lib/shared/config.ts` file.

<pre>
SEARCH_API - Endpoint of the search API.
CONSOLE_API - Endpoint of the console API.
SEARCH_SERVICE - Endpoint of management-ingress. (The value retrieved from this endpoint, is to ensure that the Search service is installed on the cluster)
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
authorization & cookie = User access token
</pre>

6. Install plugin dependencies, compile css and typescript files.

```bash
npm install
make compile-plugin
```

7. At root-level of KUI repo, install client dependencies, and start dev server.  This will initially compile code and subsequently recompile upon any file changes.

```bash
npm install
npm run watch
```

8. Open the desktop/electron instance of KUI. (Update this later with steps for ACM KUI testing).

```bash
npm run open
```

</p></details>

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
| `npm run test`                         | Run Jest tests                                                             |
| `npm run test:coverage`                | Run Jest tests and creates code coverage test-output files                 |
| `npm run test:chrome`                  | Run Nightwatch E2E testing in chrome                                       |
| `npm run test:firefox`                 | Run Nightwatch E2E testing in firefox (Default)                            |
| `npm run test:safari`                  | Run Nightwatch E2E testing in safari                                       |
| `npm run test:unit`                    | Run Jest unit tests                                                        |
| `npm run test:update-snapshot`         | Run and update Jest tests snapshots                                        |
| `npm run test:watch`                   | Watches Jest tests                                                         |
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
- [Release Versioning](https://semver.org)