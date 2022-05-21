import { NestedStack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyApp } from './construct'
import { PROJECT_ROOT } from './constants'
import type { HeyAmplifyAppStackProps } from './types'

export class BotStack extends NestedStack {
  private readonly envName: string = this.node.tryGetContext('env')

  constructor(scope: Construct, id: string, props: HeyAmplifyAppStackProps) {
    super(scope, id, props)

    const { cluster, filesystem } = props

    const secrets = {
      DISCORD_BOT_TOKEN: props.secrets.DISCORD_BOT_TOKEN,
    }

    new HeyAmplifyApp(this, 'bot', {
      cluster,
      docker: {
        name: 'bot',
        context: PROJECT_ROOT,
        dockerfile: 'apps/bot/Dockerfile',
        environment: {
          DATABASE_URL: `file:../db/${this.envName}.db`,
        },
      },
      secrets,
      filesystem,
      filesystemMountPoint: '/usr/src/apps/bot/db',
    })
  }
}
