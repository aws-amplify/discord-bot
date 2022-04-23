import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as ssm from 'aws-cdk-lib/aws-ssm'

interface DockerProps {
  context: string
  dockerfile?: string
}

export interface DiscordBotProps {
  /**
   * Asset path to the directory with the Dockerfile.
   */
  docker: DockerProps
  /**
   * Discord Bot secrets
   *
   * Discord bots can be managed in the {@link https://discord.com/developers/applications Developer Portal}.
   */
  secrets: {
    DISCORD_BOT_TOKEN: ssm.IParameter
    // [name: string]: ssm.IParameter
  }
}

export class DiscordBot extends Construct {
  constructor(scope: Construct, id: string, props: DiscordBotProps) {
    super(scope, id)

    const appName = this.node.tryGetContext('name')

    const vpc: ec2.Vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      vpcName: `${appName} VPC`,
    })

    const cluster = new ecs.Cluster(this, 'FargateCPCluster', {
      vpc,
      enableFargateCapacityProviders: true,
    })

    const secrets = {}
    for (const [name, param] of Object.entries(props.secrets)) {
      secrets[name] = ecs.Secret.fromSsmParameter(param)
    }

    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'FargateService',
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        taskImageOptions: {
          containerName: `${appName}-bot`,
          image: ecs.ContainerImage.fromAsset(props.docker.context, {
            file: props.docker.dockerfile || 'Dockerfile',
          }),
          enableLogging: true,
          secrets,
        },
        assignPublicIp: false,
        publicLoadBalancer: true,
      }
    )
  }
}
