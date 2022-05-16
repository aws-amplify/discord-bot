import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyAppStackProps } from './stack'
import { HeyAmplifyApp } from './construct'

const root = new URL('../..', import.meta.url).pathname

export class BotStack extends Stack {
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
        context: root,
        dockerfile: 'apps/bot/Dockerfile',
      },
      secrets,
      filesystem,
      filesystemMountPoint: '/usr/src/apps/bot/db',
    })
  }
}
