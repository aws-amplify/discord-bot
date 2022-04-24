# Contributing

Refer to the [readme guide](./README.md#development) to get set up for local development.

[Discord API Documentation - Application (slash) Commands](https://discord.com/developers/docs/interactions/application-commands)

## Prerequisites

- Node.js v16.x
- pnpm v6.32.3

## Package Overview

### [@hey-amplify/app](./apps/app)

The frontend is built using [Svelte-Kit](https://kit.svelte.dev) and [carbon-components-svelte](https://carbon-components-svelte.onrender.com/). It also includes a plugin for the Vite dev server to power the Discord bot. All requests routed through `/api` are handled by the plugin.

reference: [vite-plugin-discord-bot-layer](./packages/vite-plugin-discord-bot-layer)

Run `pnpm app dev` from the project root to get started!

### [@hey-amplify/builder](./packages/builder) (deprecated)

Builder is a build tool built on [esbuild](https://esbuild.github.io/). Instead of copying the same command and arguments to each individual package, this has been wrapped into a single tool for use with ESM packages. It uses a plugin to convert extensions on import from `.js` to `.cjs` due to [Node 16 ESM requiring file extensions](https://nodejs.org/docs/latest-v16.x/api/esm.html#mandatory-file-extensions):

```js
import { namedExport } from './my-module.js'
```

Turns into:

```js
const { namedExport } = require('./my-module.cjs')
```

#### Features

- auto-resolves the entrypoint to either `./index.js` or `./src/*`
- marks package dependencies as "external"

## Authoring Discord Commands

To get started, let's create a new command file in `apps/bot/src/commands`: `hello.ts`

```ts
import { createCommand } from '../Command.js'
import { createOption } from '../CommandOption.js'

const name = createOption({
  name: 'name',
  description: 'The name of the user to greet.',
  required: true,
  choices: ['world', 'everyone'],
})

export default createCommand({
  name: 'hello',
  description: 'Say hello',
  options: [name],
  handler: (context) => {
    const [name] = context.data.options
    return `hello ${name.value}`
  },
})
```

Save and register the new command with `commands.sync()`

**NOTE**: allow about 30 minutes for commands to show in Discord

## Creating Secrets

**[scripts](./scripts)**

Create secrets in SSM Parameter Store with the `scripts` helper! Rename `.env.sample` to `.env.next` and create secrets with the following command:

```bash
pnpm scripts create-secrets --envName next
```
