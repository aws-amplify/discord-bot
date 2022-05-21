import { Stack, StackProps, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { BotStack } from './nested-stack-bot'

export class RootStack extends Stack {
  private readonly appName: string = this.node.tryGetContext('name')
  private readonly envName: string = this.node.tryGetContext('env')

  public readonly secrets: Record<string, ssm.IParameter> = {}
  // public readonly vpc: ec2.Vpc
  // public readonly cluster: ecs.Cluster
  // public readonly filesystem: efs.FileSystem

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const requiredSecrets = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_APP_ID',
      'DISCORD_PUBLIC_KEY',
    ]

    const secrets = {}
    for (const secret of requiredSecrets) {
      secrets[secret] = this.getSecret(this, secret)
    }
    // TODO: remove if unnecessary after migration to root stack
    this.secrets = secrets

    Tags.of(this).add('app:name', this.appName)
    Tags.of(this).add('app:env', this.envName)

    const vpc = new ec2.Vpc(this, `vpc`, {
      maxAzs: 2,
      vpcName: `${this.appName} VPC`,
    })

    const cluster = new ecs.Cluster(this, `fargate-cluster`, {
      vpc,
      containerInsights: true,
      enableFargateCapacityProviders: true,
    })

    const filesystem = new efs.FileSystem(this, 'filesystem', {
      vpc,
    })

    new BotStack(this, `bot-stack`, {
      cluster,
      filesystem,
      secrets,
    })
  }

  /**
   * Retrieves the SecureString SSM parameter for `name`.
   * @param construct The host stack.
   * @param name The environment variable's name.
   * @returns The SSM parameter construct.
   */
  private getSecret(construct: Construct, name: string): ssm.IParameter {
    return ssm.StringParameter.fromSecureStringParameterAttributes(
      construct,
      `ssm-${name}`,
      {
        parameterName: `/app/${this.appName}/${this.envName}/secret/${name}`,
      }
    )
  }
}
