import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyApp } from './construct'
import { PROJECT_ROOT } from './constants'
import type { HeyAmplifyAppStackProps } from './types'

export class BotStack extends Stack {
  constructor(scope: Construct, id: string, props: HeyAmplifyAppStackProps) {
    super(scope, id, props)

    const { cluster, filesystem, filesystemSecurityGroup } = props

    const secrets = {
      DISCORD_BOT_TOKEN: props.secrets.DISCORD_BOT_TOKEN,
    }

    new HeyAmplifyApp(this, 'bot', {
      cluster,
      docker: {
        name: 'bot',
        context: PROJECT_ROOT,
        dockerfile: 'apps/bot/Dockerfile',
      },
      secrets,
      filesystem,
      filesystemSecurityGroup,
      filesystemMountPoint: '/usr/src/apps/bot/db',
    })
  }
}
