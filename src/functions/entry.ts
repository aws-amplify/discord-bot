import { Lambda } from 'aws-sdk'
// import { DiscordEventRequest } from 'discord-bot-cdk-construct'
import { verifyEvent } from '../discord/verifyEvent'

const lambda = new Lambda()

export async function handler(event: any): Promise<any> {
  console.log('EVENT:', JSON.stringify(event, null, 2))
  if (event) {
    const { type } = JSON.parse(event.body)
    const verify = verifyEvent(event)
    switch (type) {
      case 1: {
        if (await verify) {
          return {
            type: 1,
          }
        }
        break
      }
      case 2: {
        // handle the command, invoke command lambda
        const invoke = lambda
          .invoke({
            FunctionName: process.env.COMMAND_LAMBDA_ARN as string,
            Payload: JSON.stringify(event),
            InvocationType: 'Event',
          })
          .promise()
        if (await Promise.all([verify, invoke])) {
          console.log('Returning temporary response...')
          return {
            type: 5,
          }
        }
        break
      }
    }
  }
  throw new Error('[UNAUTHORIZED] Invalid request')
}
