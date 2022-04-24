import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as ssm from 'aws-cdk-lib/aws-ssm'

interface DockerProps {
  name: string
  context: string
  dockerfile?: string
}

export interface HeyAmplifyAppProps {
  /**
   * ECS Cluster the Application Load Balanced Fargate Service will be deployed to.
   */
  cluster: ecs.Cluster

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

export class HeyAmplifyApp extends Construct {
  public readonly service: ecs_patterns.ApplicationLoadBalancedFargateService

  constructor(scope: Construct, id: string, props: HeyAmplifyAppProps) {
    super(scope, id)

    const { cluster } = props

    const secrets = {}
    for (const [name, param] of Object.entries(props.secrets)) {
      secrets[name] = ecs.Secret.fromSsmParameter(param)
    }

    this.service = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      `fargate-service`,
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        taskImageOptions: {
          containerName: props.docker.name,
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
