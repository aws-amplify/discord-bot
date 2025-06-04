/**
 * Discord Bot AWS Infrastructure Configuration
 *
 * This file defines the AWS CDK infrastructure for deploying a Discord bot as a containerized
 * application running on AWS ECS (Elastic Container Service) with Fargate.
 *
 * The infrastructure includes:
 * - Task definition for the Discord bot container
 * - IAM roles and permissions
 * - Docker image configuration
 * - VPC and networking setup
 * - ECS cluster and Fargate service
 * - Load balancer configuration
 * - Security and secret management
 */

import { Construct } from "constructs";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam"; // IAM components for security permissions
import { StringParameter } from "aws-cdk-lib/aws-ssm"; // For accessing secure parameters
import { CfnGraphQLApi } from "aws-cdk-lib/aws-appsync"; // For AppSync GraphQL API integration
import path from "path";
import { fileURLToPath } from "url";
import { CDKContextKey } from "@aws-amplify/platform-core"; // Amplify platform context keys
import dotenv from "dotenv"; // For loading environment variables
import { secret } from "@aws-amplify/backend"; // For managing secrets
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns"; // ECS service with load balancer
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2"; // VPC and networking components
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets"; // For building and storing Docker images
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDrivers,
  Secret,
} from "aws-cdk-lib/aws-ecs"; // ECS components for container orchestration
import { CfnWebACL, CfnWebACLAssociation } from "aws-cdk-lib/aws-wafv2";
dotenv.config();

// Helper for resolving file paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Props interface for the Discord Bot Stack
 * @property dataApi - The AppSync GraphQL API that the bot will interact with
 * @property env - The environment name (e.g., dev, prod)
 * @property discordBotToken - Optional token for the Discord bot (typically provided via SSM)
 */
type DiscordBotProps = {
  dataApi: CfnGraphQLApi;
  tag: string;
  // discordBotToken?: string;
};

/**
 * Main CDK construct for the Discord Bot infrastructure
 * This class defines all AWS resources needed to run the Discord bot
 */
export class DiscordBotStack extends Construct {
  public FargateWAF: CfnWebACL;

  // Backend identifier used for resource naming and secret resolution
  private backendIdentifier = {
    name: this.node.tryGetContext(CDKContextKey.BACKEND_NAME),
    namespace: this.node.tryGetContext(CDKContextKey.BACKEND_NAMESPACE),
    type: this.node.tryGetContext(CDKContextKey.DEPLOYMENT_TYPE),
  };

  constructor(scope: Construct, id: string, props: DiscordBotProps) {
    super(scope, id);

    /**
     * Task Definition for the Discord Bot
     * - Sets memory and CPU limits
     * - Creates an IAM role with permissions to call the AppSync GraphQL API
     */
    const taskDefin = new FargateTaskDefinition(this, "DiscordBotBackend", {
      memoryLimitMiB: 1024, // Allocate 1GB of memory
      cpu: 512, // Allocate 0.5 vCPU
      taskRole: new Role(this, "DiscordBotTaskDefinitionRole", {
        roleName: "DiscordBotContainerTaskRole",
        assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"), // Allow ECS tasks to assume this role
        inlinePolicies: {
          test: new PolicyDocument({
            statements: [
              // Grant permission to execute GraphQL operations on the AppSync API
              new PolicyStatement({
                actions: ["appsync:GraphQL"],
                resources: [(props?.dataApi.attrArn + "/*") as string],
                effect: Effect.ALLOW,
              }),
            ],
          }),
        },
      }),
    });

    /**
     * Docker Image Asset for the Discord Bot
     * - Builds a Docker image from the local DiscordBotContainer directory
     * - The image will be pushed to ECR during deployment
     */
    const dbotassest = new DockerImageAsset(this, "DiscordBotImage", {
      directory: path.join(__dirname, "DiscordBot"),
      assetName: "DiscordBotContainerImage",
    });

    /**
     * Container Definition
     * - Uses the Docker image built above
     * - Configures CloudWatch logging
     * - Sets environment variables for the AppSync GraphQL endpoint
     * - Securely retrieves the Discord bot token from SSM Parameter Store
     */
    const container = taskDefin.addContainer("DiscordBotContainer", {
      image: ContainerImage.fromDockerImageAsset(dbotassest),
      logging: LogDrivers.awsLogs({
        streamPrefix: "DiscordBotContainerLogs",
        logRetention: 90, // Retain logs for 90 days
      }),
      environment: {
        // Pass the GraphQL endpoint to the container
        APPSYNC_GRAPHQL_ENDPOINT: props?.dataApi.attrGraphQlUrl as string,
      },

      // Security best practice: Use SSM Parameter Store for sensitive values
      secrets: {
        DISCORD_CLIENT: Secret.fromSsmParameter(
          StringParameter.fromSecureStringParameterAttributes(
            this,
            `${props.tag}-discordbotclient`,
            {
              parameterName: secret("DISCORD_CLIENT").resolvePath(
                this.backendIdentifier
              ).branchSecretPath,
            }
          )
        ),
        DISCORD_TOKEN: Secret.fromSsmParameter(
          StringParameter.fromSecureStringParameterAttributes(
            this,
            `${props.tag}-discordbottoken`,
            {
              parameterName: secret("DISCORD_TOKEN").resolvePath(
                this.backendIdentifier
              ).branchSecretPath,
            }
          )
        ),
      },
    });

    // Expose port 3000 from the container
    container.addPortMappings({
      containerPort: 3000,
    });

    /**
     * VPC Configuration
     * - Creates a new VPC with public and private subnets
     * - Private subnets have NAT gateways for outbound internet access
     * - Public subnets are used for the load balancer
     */
    const vpc = new Vpc(this, "DiscordBotVPC", {
      maxAzs: 3, // Use up to 3 Availability Zones for high availability
      subnetConfiguration: [
        {
          name: "PRIV",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS, // Private subnets with NAT gateway
        },
        {
          name: "PUB",
          subnetType: SubnetType.PUBLIC, // Public subnets for the load balancer
        },
      ],
    });

    /**
     * ECS Cluster
     * - Creates a new ECS cluster in the VPC
     * - The cluster will host the Fargate service
     */
    const cluster = new Cluster(this, "DiscordBotCluster", {
      vpc: vpc,
    });

    /**
     * Fargate Service with Application Load Balancer
     * - Deploys the container to Fargate (serverless container execution)
     * - Creates an Application Load Balancer for HTTP traffic
     * - Places containers in private subnets for security
     * - Configures circuit breaker for reliability
     */
    const FargateService = new ApplicationLoadBalancedFargateService(
      this,
      "DiscordBotFargateService",
      {
        cluster: cluster,
        cpu: 512, // 0.5 vCPU
        taskDefinition: taskDefin,
        taskSubnets: vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE_WITH_EGRESS, // Security: Run containers in private subnets
        }),
        memoryLimitMiB: 2048, // 2GB memory
        // publicLoadBalancer: false, // Default is true - Uncomment to make the load balancer internal
        circuitBreaker: {
          enable: true, // Enable circuit breaker for reliability
          rollback: true, // Rollback to the last stable deployment if deployment fails
        },
      }
    );

    this.FargateWAF = new CfnWebACL(this, "DiscordWaf", {
      defaultAction: { allow: {} },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "DiscordWaf",
        sampledRequestsEnabled: true,
      },
    });

    new CfnWebACLAssociation(this, "FargateWafAssociation", {
      resourceArn: FargateService.loadBalancer.loadBalancerArn,
      webAclArn: this.FargateWAF.attrArn,
    });
  }
}
