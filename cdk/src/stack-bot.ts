import { StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { HeyAmplifyStack } from './stack.js'
import { DiscordBot } from './construct-bot.js'

const root = new URL('../..', import.meta.url).pathname

interface BotStackProps extends StackProps {
  //
}

export class BotStack extends HeyAmplifyStack {
  constructor(scope: Construct, id: string, props: BotStackProps) {
    super(scope, id, props)

    const secrets = {
      DISCORD_BOT_TOKEN: this.secrets.DISCORD_BOT_TOKEN,
    }

    new DiscordBot(this, 'DiscordBot', {
      docker: {
        context: root,
        dockerfile: 'apps/bot/Dockerfile',
      },
      secrets,
    })
  }
}
