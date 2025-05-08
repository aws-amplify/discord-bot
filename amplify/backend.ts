import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { discordRestAPIFunction } from "./functions/resource";

import dotenv from "dotenv";
import { DiscordBotStack } from "./ecs/resource";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
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

// Custom stack for Discord bot
export const ecsStack = backend.createStack("ECSStack");

// Discord Bot container
new DiscordBotStack(ecsStack, "CustomDiscordBotStack", {
  dataApi: backend.data.resources.cfnResources.cfnGraphqlApi,
  tag: ecsStack.stackId,
});

backend.discordRestAPIFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["ssm:GetParameters"],
    resources: [
      `arn:aws:ssm:${backend.stack.region}:${backend.stack.account}:*`,
    ],
  })
);

// Bedrock Datasource
const MODEL_ID = "amazon.nova-premier-v1:0";
const bedrockDataSource = backend.data.addHttpDataSource(
  "BedrockDataSource",
  `https://bedrock-runtime.${backend.data.stack.region}.amazonaws.com`,
  {
    authorizationConfig: {
      signingRegion: backend.data.stack.region,
      signingServiceName: "bedrock",
    },
  }
);

const bedrockAgentDataSource = backend.data.addHttpDataSource(
  "BedrockAgentDataSource",
  `https://bedrock-agent-runtime.${backend.data.stack.region}.amazonaws.com`,
  {
    authorizationConfig: {
      signingRegion: backend.data.stack.region,
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:us-east-1::foundation-model/${MODEL_ID}`,
      `arn:aws:bedrock:us-east-2::foundation-model/${MODEL_ID}`,
      `arn:aws:bedrock:us-west-2::foundation-model/${MODEL_ID}`,
      `arn:aws:bedrock:${backend.data.stack.region}:${backend.data.stack.account}:inference-profile/us.${MODEL_ID}`,
    ],
  })
);

bedrockAgentDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "bedrock:RetrieveAndGenerate",
      "bedrock:GetInferenceProfile",
      "bedrock:Retrieve",
      "bedrock:InvokeModel",
    ],
    resources: ["*"],
  })
);

backend.data.resources.cfnResources.cfnGraphqlApi.environmentVariables = {
  MODEL_ID: "us." + MODEL_ID,
};
