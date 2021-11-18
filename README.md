# Discord Interaction Bot

- [Ideas Discussion](https://github.com/josefaidt/amplify-discord-bots/discussions/1)
- [Discord API Documentation - Slash Commands](https://discord.com/developers/docs/interactions/slash-commands)

## Commands and Permissions

Ideally command config and logic will lie within this codebase, and granular permissions can be tweaked from an admin UI. Calling a POST request to `/sync` will add or update all commands from the codebase with default permissions (anyone can execute).

### Required Bot Permissions

- view channels
- manage channels
- manage roles
- send messages

## Development

For local development, ensure the following preqrequisites are met:

- AWS account
- Node.js v16.x

To confirm changes to code are made successfully, use the following steps to set up and run the interaction bot:

1. [Register Discord bot](https://discord.com/developers/applications)
2. `amplify init --app https://github.com/josefaidt/amplify-discord-bots`
3. Add Discord secrets to function when prompted, **do not** add secrets to `discordsync` function. It is not necessary as the sync function references `discordinteraction` secrets
4. `amplify push`
5. Register commands by calling `/sync` endpoint from API Gateway
6. Register interaction endpoint (API Gateway endpoint + `/interact`) with Discord

### Local Development Notes

- Discord requires a secure public URL registered as an "Interactions Endpoint URL". This can be found in the Discord application's "General Information" section. When deploying to your AWS account, this URL will be returned from `amplify push -y`
  - Use [ngrok](https://ngrok.com) to tunnel connections to your local host

Further local development notes TBD.

## Deployment

This repository is connected using [AWS Amplify Console](https://docs.amplify.aws/console/) for continuous integration.
