# AWS Amplify Discord Bot: "hey-amplify"

This repository contains the source code for the [AWS Amplify Discord Server](https://discord.gg/8RFCGKMfVM)'s bot!

## Features

- thread data is tracked by title, original poster ID, and whether the thread is solved (`GET /api/questions`)
- dashboard component to visualize questions and channel "health"
- `Select Answer` and `/solved` commands.

## Getting Started

**Pre-requisites**:

- Node.js v18.x

### Quick Start

1. `gh repo fork aws-amplify/discord-bot`
2. `npm install`
3. Setup Ampilfy locally - LINK
4. Using `.env.sample` as a template, create a `.env` file and [add necessary Discord environment values](#setting-up-a-discord-bot)
   - Note: You may need to setup the IDP provider.
5. Initiallize the sandbox `npx ampx sandbox`
6. After the sandbox has deployed, run the application with `npm run dev`
<!-- 5. As the server owner navigate to `http://localhost:3000/`, log in, and visit `/admin` to configure the instance -->

### Setting up a Discord Bot

1. (optional) create a [new Discord server](https://discord.new) or create from the [AWS Amplify Discord server template](https://discord.new/vmyFvRYDtUsn)
2. [Register Discord bot](https://discord.com/developers/applications)
3. Make note of the App ID <!-- to add the bot to your Discord server using the following URL -->
4. Make note of the Bot Secret

### Integrating backend

- add discord bot app id and secret to SSM Parameter store
- decide if using oAuth or user/password
- if using oauth, retrieve your oidc details and add them to `./amplify/auth/resource.ts`
- store the secrets

  - sandbox: use `npx ampx sandbox secret set <SECRET_NAME>`
  - git based deploy: use console

<!--
 ```text
 https://discord.com/api/oauth2/authorize?client_id=<app-id>&permissions=335812774976&scope=bot%20applications.commands
 ```
-->

<!-- 4. Enable OAuth and add `http://localhost:3000/api/auth/callback/discord` as a redirect -->

<!-- 5. Make note of the OAuth secrets and populate `.env` -->

<!-- ### .env

The `.env` file contains the names of the secrets that are created locally with `npx ampx secret set` or in the Amplify Hosting console. For example locally:

1. Create a secret called 'MY_IDP_CLIENT_ID' with `npx ampx secret set MY_GOOGLE_CLIENT_ID` and set the value.
2. In the `.env` file, add the entry `AUTH_CLIENT_ID_NAME=MY_GOOGLE_CLIENT_ID`. -->

#### Required Bot Permissions

The URL noted in step 2 above has the permissions integer of `335812774976` which includes the following bot permissions:

![bot permissions](./docs/bot-permissions.png)

## Contributing

Learn how to get started with our [contribution guide](./CONTRIBUTING.md)
