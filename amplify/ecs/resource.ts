import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { CfnGraphQLApi } from "aws-cdk-lib/aws-appsync";

import path from "path";
import { fileURLToPath } from "url";
import { CDKContextKey } from "@aws-amplify/platform-core";

import dotenv from "dotenv";
import { secret } from "@aws-amplify/backend";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type DiscordBotProps = {
  dataApi: CfnGraphQLApi;
  env: string;
  discordBotToken?: string;
};
export class DiscordBotStack extends Construct {
  private backendIdentifier = {
    name: this.node.tryGetContext(CDKContextKey.BACKEND_NAME),
    namespace: this.node.tryGetContext(CDKContextKey.BACKEND_NAMESPACE),
    type: this.node.tryGetContext(CDKContextKey.DEPLOYMENT_TYPE),
  };
  constructor(scope: Construct, id: string, props: DiscordBotProps) {
    super(scope, id);
    // const { name } = props

    const taskDefin = new ecs.FargateTaskDefinition(this, "DiscordBotBackend", {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole: new iam.Role(this, "DiscordBotTaskDefinitionRole", {
        roleName: "DiscordBotContainerTaskRole",
        assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        inlinePolicies: {
          test: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ["appsync:GraphQL"],
                resources: [(props?.dataApi.attrArn + "/*") as string],
                effect: iam.Effect.ALLOW,
              }),
            ],
          }),
        },
      }),
    });

    const dbotassest = new ecr_assets.DockerImageAsset(
      this,
      "DiscordBotImage",
      {
        directory: path.join(__dirname, "..", "..", "/DiscordBotContainer"),
        assetName: "DiscordBotContainerImage",
      }
    );

    const container = taskDefin.addContainer("DiscordBotContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dbotassest),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "DiscordBotContainerLogs",
        logRetention: 90,
      }),
      environment: {
        APPSYNC_GRAPHQL_ENDPOINT: props?.dataApi.attrGraphQlUrl as string,
      },

      secrets: {
        DISCORDBOT_TOKEN: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(
            this,
            `${props.env}-discordbottoken`,
            {
              // parameterName: process.env.DISCORDBOT_TOKEN_NAME as string,
              parameterName: secret(
                process.env.DISCORDBOT_TOKEN_NAME as string
              ).resolvePath(this.backendIdentifier).branchSecretPath,
            }
          )
        ),
      },
    });

    container.addPortMappings({
      containerPort: 3000,
    });

    const vpc = new ec2.Vpc(this, "DiscordBotVPC", {
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: "PRIV",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: "PUB",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const cluster = new ecs.Cluster(this, "DiscordBotCluster", {
      vpc: vpc,
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "DiscordBotFargateService",
      {
        cluster: cluster,
        cpu: 512, // Default is 256
        taskDefinition: taskDefin,
        taskSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }),
        memoryLimitMiB: 2048, // Default is 512
        // publicLoadBalancer: false, // Default is true
        circuitBreaker: {
          enable: true,
          rollback: true,
        },
      }
    );
  }
}
