# Discord Interaction Bot

- [Ideas Discussion](https://github.com/josefaidt/amplify-discord-bots/discussions/1)
- [Discord API Documentation - Slash Commands](https://discord.com/developers/docs/interactions/slash-commands)

## Commands and Permissions

Ideally command config and logic will lie within this codebase, and granular permissions can be tweaked from an admin UI. Calling a POST request to `/api/commands/sync` will add or update all commands from the codebase with default permissions (anyone can execute).

### Required Bot Permissions

- view channels
- manage channels
- manage roles
- send messages

## Development

For local development, ensure the following preqrequisites are met:

- AWS account (with credentials stored in `~/.aws/credentials`, this is mounted to container for local development)
- Docker
- Node.js v16.x

To confirm changes to code are made successfully, use the following steps to set up and run the interaction bot:

1. [Register Discord bot](https://discord.com/developers/applications)
2. Using `.env.sample` as a template, use [AWS Copilot CLI](https://aws.github.io/copilot-cli/) to add secrets
   ```sh
   copilot secret init
   ```
3. Run `docker-compose up --build`

### Local Development Notes

- `.env` should match environment variables set up to deploy with Copilot as shown in [the manifest](./copilot/interactions-bot/manifest.yml), using `.env.sample` as a template
- Discord requires a secure public URL registered as an "Interactions Endpoint URL". This can be found in the Discord application's "General Information" section. When deploying to your AWS account, this URL will be returned from `copilot deploy`
  - Use [ngrok](https://ngrok.com) to tunnel connections to your local host

#### Run the Bot

Following the development steps in the previous section:

1. Run `ngrok http 3000`
2. Add tunneled URL to [your bot's](https://discord.com/developers/applications/) Interaction Endpoint URL
3. Run `yarn dev`
4. Sync commands by making a POST call to `http://localhost:3000/api/commands/sync`, allow about 30 minutes for commands to show in Discord

#### Run the Management UI (App)

The [management UI](/app) proxies requests to `/api` in local dev, and is recommended to run with the bot:

1. Follow the steps above to run the bot locally
2. In the app directory, install dependencies with `yarn install`
3. Run the local dev server with `yarn dev`

## Deployment

Currently this process is manual and executed with `copilot deploy`
