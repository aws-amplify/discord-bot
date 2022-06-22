# AWS Amplify Discord Bot: "hey-amplify"

This repository contains the source code for the [AWS Amplify Discord Server](https://discord.gg/8RFCGKMfVM)'s bot!

## Features

- auto-threads "help" channels; if a channel follows the `<category>-help` naming convention messages will automatically get converted into threads
  - thread data is tracked by title, original poster ID, and whether the thread is solved (`GET /api/questions`)
- command: `/giverole` - accepts a ROLE and USER argument to grant a role (NOTE: this command is disabled by default for `@everyone`)
- command: `/contribute` - accepts an Amplify project argument and returns the GitHub contribution URL
- command: `/github` - accepts an Amplify project argument and returns the GitHub repository URL
- command: `/thread` - command suite for thread owners
  - `/thread rename <title>` - allows thread owners to rename their threads
  - `/thread archive` - allows thread owners to optionally archive their thread
  - `/thread solved` - allows thread owners to mark their question (thread) as "solved", which changes prepended `?` with ✅
  - `/thread reopen` - allows thread owners to "reopen" their question (thread), which changes prepended ✅ with `?`

## Getting Started

**Pre-requisites**:

- Node.js v16.x
- pnpm v6.32.3

1. `gh repo fork aws-amplify/discord-bot`
2. `pnpm run setup`
3. Rename `.env.sample` to `.env` and [add necessary Discord environment values](#setting-up-a-discord-bot)
4. Run the bot with `pnpm dev`
5. Navigate to `http://localhost:3000/admin` and sync the commands
6. Refresh your Discord client and try out a command!

### Setting up a Discord Bot

<!-- TODO: screenshots -->

1. [Register Discord bot](https://discord.com/developers/applications)
2. Make note of the App ID to add the bot to your Discord server using the following URL
   ```text
   https://discord.com/api/oauth2/authorize?client_id=<app-id>&permissions=335812774976&scope=bot%20applications.commands
   ```

#### Required Bot Permissions

The URL noted in step 2 above has the permissions integer of `335812774976` which includes the following bot permissions:

![bot permissions](./docs/bot-permissions.png)

## Contributing

Learn how to get started with our [contribution guide](./CONTRIBUTING.md)
