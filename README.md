# AWS Amplify Discord Bot: "hey-amplify"

This repository contains the source code for the [AWS Amplify Discord Server](https://discord.gg/8RFCGKMfVM)'s bot!

## Features

- auto-threads "help" channels; if a channel follows the `<category>-help` naming convention messages will automatically get converted into threads
  - thread data is tracked by title, original poster ID, and whether the thread is solved (`GET /api/questions`)
- dashboard component to visualize questions and channel "health"
- support for GitHub to Discord webhooks (used for posting release notes)
- command: `/admin mirror <repository>` accepts a REPOSITORY and posts the thread to GitHub Discussions
- command: `/contribute` - accepts an Amplify project argument and returns the GitHub contribution URL
- command: `/github` - accepts an Amplify project argument and returns the GitHub repository URL
- command: `/giverole` - accepts a ROLE and USER argument to grant a role (NOTE: this command is disabled by default for `@everyone`)
- command: `/login` sends an ephemeral link to login to GitHub and link accounts
- command: `/thread` - command suite for thread owners
  - `/thread rename <title>` - allows thread owners to rename their threads
  - `/thread archive` - allows thread owners to optionally archive their thread
  - `/thread solved` - allows thread owners to mark their question (thread) as "solved", which changes prepended `?` with ✅
  - `/thread reopen` - allows thread owners to "reopen" their question (thread), which changes prepended ✅ with `?`
- supports multiple guilds

## Getting Started

**Pre-requisites**:

- Node.js v18.x
- pnpm v7.13.1

### Quick Start

1. `gh repo fork aws-amplify/discord-bot`
2. `pnpm setup-dev`
3. Using `.env.sample` as a template, create a `.env` file and [add necessary Discord environment values](#setting-up-a-discord-bot)
4. Run the application with `pnpm dev`
5. As the server owner navigate to `http://localhost:3000/`, log in, and visit `/admin` to configure the instance

Once you are finished working with the Discord Bot you will want to stop the database container with `pnpm stop-db`

### Setting up a Discord Bot

<!-- TODO: screenshots -->

1. (optional) create a [new Discord server](https://discord.new) or create from the [AWS Amplify Discord server template](https://discord.new/vmyFvRYDtUsn)
2. [Register Discord bot](https://discord.com/developers/applications)
3. Make note of the App ID to add the bot to your Discord server using the following URL

   ```text
   https://discord.com/api/oauth2/authorize?client_id=<app-id>&permissions=335812774976&scope=bot%20applications.commands
   ```

4. Enable OAuth and add `http://localhost:3000/api/auth/callback/discord` as a redirect
5. Make note of the OAuth secrets and populate `.env`

#### Required Bot Permissions

The URL noted in step 2 above has the permissions integer of `335812774976` which includes the following bot permissions:

![bot permissions](./docs/bot-permissions.png)

## Contributing

Learn how to get started with our [contribution guide](./CONTRIBUTING.md)
