import { defineFunction, secret } from "@aws-amplify/backend";

export const discordRestAPIFunction = defineFunction({
  entry: "./discord-rest-api/handler.ts",
  environment: {
    DISCORD_GUILD_ID: secret(process.env.DISCORDBOT_GUILDID_NAME as string), //secret("DISCORD_GUILD_ID"),
    DISCORDBOT_TOKEN: secret(process.env.DISCORDBOT_TOKEN_NAME as string), //secret("DISCORD_BOT_TOKEN"),
  },
});

const r = secret("");
