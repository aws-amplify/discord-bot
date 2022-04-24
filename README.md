# hey-amplify

Welcome to hey-amplify! This repository contains the source code for the [AWS Amplify Discord Server](https://discord.gg/8RFCGKMfVM)'s bot!

## Getting Started

**Pre-requisites**:

- Node.js v16.x
- pnpm v6.32.3

1. `gh repo fork josefaidt/amplify-discord-bots`
2. `pnpm install`
3. `pnpm build`
4. Rename `.env.sample` to `.env.local` and add necessary Discord environment values
5. Install dependencies with `pnpm install`
6. Run the app with `pnpm app dev`
7. Run the bot with `pnpm bot dev`
8. Navigate to `http://localhost:3000/admin` and sync the commands (**NOTE**: allow about 30 minutes for commands to show in Discord)

### Setting up a Discord Bot

<!-- TODO: screenshots -->

1. [Register Discord bot](https://discord.com/developers/applications)
2. Make note of the App ID to add the bot to your Discord server using the following URL
   ```text
   https://discord.com/api/oauth2/authorize?client_id=<app-id>&permissions=2483045376&scope=bot%20applications.commands
   ```

#### Required Bot Permissions

The URL noted in step 2 above has the permissions integer of `2483045376` which includes the following bot permissions:

- view channels
- manage channels
- manage roles
- send messages
