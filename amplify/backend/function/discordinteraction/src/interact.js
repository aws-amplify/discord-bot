import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { verifyEvent } from '@hey-amplify/discord'

async function invoke(payload) {
  const client = new LambdaClient({ region: process.env.REGION })

  /** @type {import('@aws-sdk/client-lambda').InvokeCommandInput} */
  const input = {
    FunctionName: process.env.FUNCTION_DISCORDINTERACTIONHANDLER_NAME,
    Payload: JSON.stringify(payload),
    InvocationType: 'Event',
  }

  /** @type {import('@aws-sdk/client-lambda').Command} */
  const command = new InvokeCommand(input)

  /** @type {import('@aws-sdk/client-lambda').InvokeCommandOutput} */
  const output = await client.send(command)

  return output
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  if (event?.body && (await verifyEvent(event))) {
    const { type } = event.body
    switch (type) {
      case 1: {
        return {
          type: 1,
        }
      }
      case 2: {
        await invoke(event)
        return {
          type: 5,
        }
      }
    }
  }
  throw new Error('[UNAUTHORIZED] Invalid request')
}
