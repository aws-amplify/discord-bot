# Contributing

Refer to the [readme guide](./readme.md#development) to get set up for local development.

[Discord API Documentation - Application (slash) Commands](https://discord.com/developers/docs/interactions/application-commands)

## Prerequisites

- Node.js v16.x
- yarn v1.x

## Package Overview

### [@amplify-discord-bots/app](./packages/app)

The frontend is built using [Svelte-Kit](https://kit.svelte.dev) and [carbon-components-svelte](https://carbon-components-svelte.onrender.com/). It also includes a plugin for the Vite dev server to power the Discord bot. All requests routed through `/api` are handled by the plugin.

reference: [vite-plugin-discord-bot-layer](./packages/vite-plugin-discord-bot-layer)

Run `yarn dev` from the project root to get started!

### [@amplify-discord-bots/builder](./packages/builder)

Builder is a build tool built on [esbuild](https://esbuild.github.io/). Instead of copying the same command and arguments to each individual package, this has been wrapped into a single tool for use with ESM packages. It leverages a plugin to convert extensions on import to cjs due to [Node 16 ESM requiring file extensions](https://nodejs.org/docs/latest-v16.x/api/esm.html#mandatory-file-extensions):

```js
import { namedExport } from './my-module.js'
```

Turns into:

```js
const { namedExport } = require('./my-module.cjs)
```

#### Features

- auto-resolves the entrypoint to either `./index.js` or `./src/*`
- marks package dependencies as "external"

### [@amplify-discord-bots/bank](./packages/bank)

The command bank! More on this below in [Authoring Application Commands](#authoring-application-commands)

## Authoring Application Commands

The following sample `package.json` serves as a template for authoring `/sample`, an application command located at `/packages/command-sample`:

```json
{
  "name": "@amplify-discord-bots/command-sample",
  "version": "0.1.0",
  "type": "module",
  "license": "Apache-2.0",
  "exports": {
    ".": {
      "import": "./src/index.js",
      "require": "./lib/index.cjs"
    },
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "builder",
    "prepublishOnly": "yarn build --minify"
  },
  "dependencies": {},
  "devDependencies": {
    "@amplify-discord-bots/builder": "*"
  }
}
```

Application Commands' entrypoint requires two exports:

```js
// https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
export const config = {
  name: 'sample',
  description: 'My Sample Command',
  // ...
}

/**
 * @name handler
 * @param {object} context
 * @returns {(string|object)}
 */
export async function handler(context) {
  //
}
```

After creating the new Application Command project, head on over to the [bank](./packages/bank), add it as a dependency, and add to the commands array.

```diff
{
  // ...
  "dependencies": {
    "@amplify-discord-bots/command-giverole": "*",
+   "@amplify-discord-bots/command-sample": "*",
    "@amplify-discord-bots/command-static": "*"
  },
  }
```

```js
// packages/bank/src/index.js
// ...
const commands = [giverole, sample]
```

From the project root, install dependencies with `yarn install`, restart the dev server, and sync commands.

**NOTE**: allow about 30 minutes for commands to show in Discord
