import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class HeyAmplifyStack extends Stack {
  // TODO: type SSM value
  public readonly secrets: Record<string, ssm.IParameter> = {}

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const requiredSecrets = [
      'DISCORD_BOT_TOKEN',
      'DISCORD_APP_ID',
      'DISCORD_PUBLIC_KEY',
    ]

    for (const secret of requiredSecrets) {
      this.secrets[secret] = this.getSecret(this, secret)
    }
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
      `SsmParameter_${name}`,
      {
        parameterName: `/app/hey-amplify/env/secret/${name}`,
      }
    )
  }
}
