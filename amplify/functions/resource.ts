import { defineFunction, secret } from "@aws-amplify/backend";

export const discordRestAPIFunction = defineFunction({
  entry: "./discord-rest-api/handler.ts",
  environment: {
    DISCORD_GUILD: secret("DISCORD_GUILD"),
    DISCORD_TOKEN: secret("DISCORD_TOKEN"),
  },
  timeoutSeconds: 15,
});
