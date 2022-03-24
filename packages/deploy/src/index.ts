import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ssm from "aws-cdk-lib/aws-ssm";

/**
 * Properties for deployment of the {@link DiscordBot} to AWS Fargate.
 */
export interface DiscordBotProps {
  /**
   * The path to the directory with the Dockerfile.
   */
  dockerPath: string;

  /**
   * The Discord bot token, injected as a secret to the Docker container.
   *
   * Discord bots can be managed in the {@link https://discord.com/developers/applications Developer Portal}.
   */
  discordBotToken: ssm.IParameter;

  /**
   * Optional integration with GitHub Discussions.
   *
   * Requires creating a GitHub App and private key in GitHub {@link https://github.com/settings/apps settings}.
   */
  githubIntegration?: DiscordBotGithubIntegration;
}

/**
 * Integration parameters for the GitHub App.
 */
export interface DiscordBotGithubIntegration {
  /**
   * The list of GitHub owner/repo tags, injected as a secret to the Docker container,
   * and use to configure the permissions for the bot.
   *
   * e.g. `"aws-amplify/amplify-flutter,aws-amplify/amplify-js"`
   */
  githubRepos: ssm.IParameter;

  /**
   * The GitHub App ID, injected as a secret to the Docker container.
   *
   * GitHub Apps can be created in GitHub {@link https://github.com/settings/apps settings}.
   */
  githubAppId: ssm.IParameter;

  /**
   * The GitHub App private key, injected as a secret to the Docker container.
   *
   * GitHub Apps can be created in GitHub {@link https://github.com/settings/apps settings}.
   */
  githubPrivateKey: ssm.IParameter;
}

/**
 * A containerized Discord bot, deployed to AWS Fargate.
 */
export class DiscordBot extends Construct {
  /**
   * The environment variable name for the Discord bot token.
   */
  static discordBotTokenEnv = "DISCORD_BOT_TOKEN";

  /**
   * The environment variable name for the string-separated GitHub repositories.
   */
  static githubReposEnv = "GITHUB_REPOS";

  /**
   * The environment variable name for the GitHub App ID.
   * 
   * GitHub Apps can be created in GitHub {@link https://github.com/settings/apps settings}.
   */
  static githubAppIdEnv = "GITHUB_APP_ID";

  /**
   * The environment variable name for the GitHub App private key.
   * 
   * GitHub Apps can be created in GitHub {@link https://github.com/settings/apps settings}.
   */
  static githubPrivateKeyEnv = "GITHUB_PRIVATE_KEY";

  constructor(scope: Construct, id: string, props: DiscordBotProps) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      vpcName: "Discord Bot VPC",
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc,
    });

    const secrets: {
      [key: string]: ecs.Secret;
    } = {
      [DiscordBot.discordBotTokenEnv]: ecs.Secret.fromSsmParameter(
        props.discordBotToken
      ),
    };
    const githubIntegration = props.githubIntegration;
    if (githubIntegration) {
      secrets[DiscordBot.githubReposEnv] = ecs.Secret.fromSsmParameter(
        githubIntegration.githubRepos
      );
      secrets[DiscordBot.githubAppIdEnv] = ecs.Secret.fromSsmParameter(
        githubIntegration.githubAppId
      );
      secrets[DiscordBot.githubPrivateKeyEnv] = ecs.Secret.fromSsmParameter(
        githubIntegration.githubPrivateKey
      );
    }
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "FargateService",
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset(props.dockerPath),
          enableLogging: true,
          secrets,
        },
        assignPublicIp: false,
        publicLoadBalancer: true,
      }
    );
  }
}
