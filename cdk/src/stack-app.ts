import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyAppStackProps } from './stack'
import { HeyAmplifyApp } from './construct'

const root = new URL('../..', import.meta.url).pathname

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
        context: root,
        dockerfile: 'apps/app/Dockerfile',
      },
      secrets,
    })
  }
}
