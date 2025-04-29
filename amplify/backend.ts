import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { discordRestAPIFunction } from "./functions/resource";
// import { DiscordBotStack } from "./custom/DiscordBot/resource";
// import { DiscordRestApi } from "./custom/DiscordRestApi/resource";

import dotenv from "dotenv";
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_ISSUER_URL: string;
      AUTH_CALLBACK_URLS: string;
      AUTH_LOGOUT_URLS: string;
      AUTH_CLIENT_ID_NAME: string;
      AUTH_CLIENT_SECRET_NAME: string;
      DISCORDBOT_TOKEN_NAME: string;
      DISCORDBOT_GUILDID_NAME: string;
    }
  }
}

export const backend = defineBackend({
  auth,
  data,
  discordRestAPIFunction,
});

// BackendContext
// const amplifyBackendNamespace =
//   backend.auth.resources.userPool.node.tryGetContext(
//     "amplify-backend-namespace"
//   );
// const amplifyBackendName = backend.auth.resources.userPool.node.tryGetContext(
//   "amplify-backend-name"
// );

// Only allow Admin created users
// backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
//   allowAdminCreateUserOnly: true,
// };

// Custom stack for Discord bot
// export const customStack = backend.createStack("DiscordBotStack");

// Discord Bot container
// new DiscordBotStack(customStack, "CustomDiscordBotStack", {
//   dataApi: backend.data.resources.cfnResources.cfnGraphqlApi,
//   env: amplifyBackendName,
//   // discordBotToken: "discord-bot-token",
// });

// Discord bot Rest API
// const discordBotRestApi = new DiscordRestApi(
//   customStack,
//   "CustomStackDiscordBotApi",
//   {
//     env: amplifyBackendName,
//     lambdaFunction: backend.discordRestAPIFunction.resources.lambda,
//   }
// );

// Outputs
// backend.addOutput({
//   custom: {
//     discordBotRestAPIEndpoint: discordBotRestApi.api.url,
//     // hostedUIDomain: domain.baseUrl({}),
//   },
// });
