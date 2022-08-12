import { Stack, StackProps, Tags, RemovalPolicy } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { HeyAmplifyApp } from './components/hey-amplify-app'
import { PROJECT_ROOT } from './constants'
import { getSvelteKitEnvironmentVariables } from './support'
import { AmplifyAwsSubdomain } from './components/amplify-aws-subdomain'
import { SupportBox } from './components/support-box'
import type { AmplifyAwsSubdomainProps } from './components/amplify-aws-subdomain'

type HeyAmplifyStackProps = Partial<StackProps> & {
  subdomain: AmplifyAwsSubdomainProps | undefined
}

export class HeyAmplifyStack extends Stack {
  private readonly appName: string = this.node.tryGetContext('name')
  private readonly envName: string = this.node.tryGetContext('env')

  public readonly secrets: Record<string, ssm.IParameter> = {}

  constructor(scope: Construct, id: string, props: HeyAmplifyStackProps) {
    super(scope, id, props)

    const requiredSecrets = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_APP_ID',
      'DISCORD_PUBLIC_KEY',
      'DISCORD_AUTH_CLIENT_ID',
      'DISCORD_AUTH_CLIENT_SECRET',
      'DISCORD_WEBHOOK_URL_RELEASES',
      'GITHUB_WEBHOOK_SECRET',
      'GITHUB_APP_ID',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'GITHUB_PRIVATE_KEY',
      'NEXTAUTH_SECRET',
    ] as const
    // NOTE: this TypeScript trick is to say `secrets` should include key value pairs where the keys are one of the names in the array above
    const secrets: Partial<
      Record<typeof requiredSecrets[number], ssm.IParameter>
    > = {}

    for (const secret of requiredSecrets) {
      secrets[secret] = this.getSecret(this, secret)
    }
    // TODO: remove if unnecessary after migration to root stack
    this.secrets = secrets

    Tags.of(this).add('app:name', this.appName)
    Tags.of(this).add('app:env', this.envName)

    const vpc = new ec2.Vpc(this, `Vpc`, {
      maxAzs: 2,
      vpcName: `vpc-${this.appName}-${this.envName}`,
    })

    const cluster = new ecs.Cluster(this, `Cluster`, {
      vpc,
      containerInsights: true,
      enableFargateCapacityProviders: true,
    })

    const filesystem = new efs.FileSystem(this, 'Filesystem', {
      vpc,
    })

    let subdomain: AmplifyAwsSubdomain | undefined
    if (props.subdomain) {
      subdomain = new AmplifyAwsSubdomain(this, 'Subdomain', props.subdomain)
    }

    // create bucket for SQLite backups with Litestream
    const bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: `${this.appName}-${this.envName}-bucket`,
      /**
       * @TODO enable bucket encryption when supported by litestream (sqlite backup solution)
       * https://github.com/benbjohnson/litestream/issues/88
       */
      bucketKeyEnabled: true,
      encryption: s3.BucketEncryption.KMS,
      enforceSSL: true,
      versioned: true,
      // if env is destroyed, keep the bucket
      removalPolicy: RemovalPolicy.RETAIN,
      // autoDeleteObjects: true,
      serverAccessLogsPrefix: 's3-access',
    })

    const filesystemMountPoint = '/data'
    new HeyAmplifyApp(this, `Bot`, {
      bucket,
      cluster,
      docker: {
        name: `${this.appName}-bot`,
        context: PROJECT_ROOT,
        dockerfile: 'Dockerfile',
        environment: {
          DATABASE_URL: `file:${filesystemMountPoint}/${this.envName}.db`,
          ...getSvelteKitEnvironmentVariables(this.envName),
        },
      },
      secrets,
      subdomain,
      filesystem,
      filesystemMountPoint,
    })

    new SupportBox(this, 'SupportBox', {
      bucket,
      filesystem,
      subdomain,
      vpc,
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
