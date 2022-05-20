import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyApp } from './construct'
import { PROJECT_ROOT } from './constants'
import type { HeyAmplifyAppStackProps } from './types'

export class SvelteKitAppStack extends Stack {
  constructor(scope: Construct, id: string, props: HeyAmplifyAppStackProps) {
    super(scope, id, props)

    const { cluster } = props

    const secrets = {
      DISCORD_BOT_TOKEN: props.secrets.DISCORD_BOT_TOKEN,
    }

    new HeyAmplifyApp(this, 'app', {
      cluster,
      docker: {
        name: 'app',
        context: PROJECT_ROOT,
        dockerfile: 'apps/app/Dockerfile',
      },
      secrets,
    })
  }
}
