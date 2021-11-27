# amplify-bot

Welcome to the amplify-bot repository!

## Getting Started

### Setting up a Discord Bot

<!-- TODO: screenshots -->

1. [Register Discord bot](https://discord.com/developers/applications)
2. Make note of the App ID to add to your Discord server using the following URL
   ```text
   https://discord.com/api/oauth2/authorize?client_id=<app-id>&permissions=2483045376&scope=bot%20applications.commands
   ```

#### Required Bot Permissions

The URL noted in step 2 above has the permissions integer of `2483045376` which includes the following bot permissions:

- view channels
- manage channels
- manage roles
- send messages

### Development

For local development, ensure the following preqrequisites are met:

- Node.js v16.x (`nvm use`)
- yarn v1.x (`npm i -g yarn`)

1. [Register Discord bot](https://discord.com/developers/applications)
2. Rename `.env.sample` to `.env` and add necessary Discord environment values
3. Install dependencies with `yarn install`
4. Run the app with `yarn dev` -- this will run both the Svelte-Kit app and the bot layer
5. Tunnel your connection with [ngrok](https://www.npmjs.com/package/ngrok): `ngrok http 3000`
6. Add tunneled URL to your bot's Interaction Endpoint URL: `<ngrok-https-url>/api/interact`
7. Save your changes and register application commands to your bot with the frontend (or send an empty POST request to `http://localhost:3000/api/commands/sync`). **NOTE**: allow about 30 minutes for commands to show in Discord

For more information on how to contribute, visit the [contributing documentation](./CONTRIBUTING.md)
