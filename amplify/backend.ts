import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { discordRestAPIFunction } from "./functions/resource";

import dotenv from "dotenv";
import { DiscordBotStack } from "./ecs/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BedrockModelDSStack } from "./bedrock/resource";
import { MonitoringStack } from "./monitoring/resource";
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ISSUER_URL: string;
      CALLBACK_URLS: string;
      LOGOUT_URLS: string;
    }
  }
}

export const backend = defineBackend({
  auth,
  data,
  discordRestAPIFunction,
});
export type BackendType = typeof backend;
// Custom stack for Discord bot
export const ecsStack = backend.createStack("ECSStack");

// Discord Bot container
const discordBotContainer = new DiscordBotStack(
  ecsStack,
  "CustomDiscordBotStack",
  {
    dataApi: backend.data.resources.cfnResources.cfnGraphqlApi,
    tag: ecsStack.stackId,
  }
);

backend.discordRestAPIFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["ssm:GetParameters"],
    resources: [
      `arn:aws:ssm:${backend.stack.region}:${backend.stack.account}:*`,
    ],
  })
);

new BedrockModelDSStack(backend.stack, "nova", {
  backend,
  modelId: "amazon.nova-premier-v1:0",
});

new MonitoringStack(backend.stack, "MonitoringStack", {
  appsyncApi: backend.data.resources.cfnResources.cfnGraphqlApi,
  waf: discordBotContainer.FargateWAF,
});

// import { aws_bedrock as bedrock } from "aws-cdk-lib";
// const vectorKnowledgeBaseConfigurationProperty: bedrock.CfnKnowledgeBase.VectorKnowledgeBaseConfigurationProperty =
//   {
//     embeddingModelArn: "embeddingModelArn",

//     // the properties below are optional
//     embeddingModelConfiguration: {
//       bedrockEmbeddingModelConfiguration: {
//         dimensions: 123,
//         embeddingDataType: "embeddingDataType",
//       },
//     },
//     supplementalDataStorageConfiguration: {
//       supplementalDataStorageLocations: [
//         {
//           supplementalDataStorageLocationType:
//             "supplementalDataStorageLocationType",

//           // the properties below are optional
//           // s3Location: {
//           //   uri: "uri",
//           // },

//         },
//       ],
//     },
//   };
