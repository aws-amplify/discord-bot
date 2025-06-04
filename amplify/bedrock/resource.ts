import { Construct } from "constructs";
import { BackendType } from "../backend";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

type BedrockDSStackProps = {
  //   dataApi: CfnGraphQLApi;
  backend: BackendType;
  modelId: string;
  // discordBotToken?: string;
};

export class BedrockModelDSStack extends Construct {
  constructor(scope: Construct, id: string, props: BedrockDSStackProps) {
    super(scope, id);

    // Bedrock Datasource
    const MODEL_ID = props.modelId; //"amazon.nova-premier-v1:0";
    const bedrockDataSource = props.backend.data.addHttpDataSource(
      "BedrockDataSource",
      `https://bedrock-runtime.${props.backend.data.stack.region}.amazonaws.com`,
      {
        authorizationConfig: {
          signingRegion: props.backend.data.stack.region,
          signingServiceName: "bedrock",
        },
      }
    );

    const bedrockAgentDataSource = props.backend.data.addHttpDataSource(
      "BedrockAgentDataSource",
      `https://bedrock-agent-runtime.${props.backend.data.stack.region}.amazonaws.com`,
      {
        authorizationConfig: {
          signingRegion: props.backend.data.stack.region,
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
          `arn:aws:bedrock:${props.backend.data.stack.region}:${props.backend.data.stack.account}:inference-profile/us.${MODEL_ID}`,
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

    props.backend.data.resources.cfnResources.cfnGraphqlApi.environmentVariables =
      {
        MODEL_ID: "us." + MODEL_ID,
      };
  }
}
