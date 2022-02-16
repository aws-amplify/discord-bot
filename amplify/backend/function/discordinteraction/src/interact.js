import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { verifyEvent } from '@hey-amplify/discord'

/**
 * Invoke our Lambda function with a payload
 * @param {Object.<string, any>} payload
 * @returns {Promise<import('@aws-sdk/client-lambda').InvokeCommandOutput>}
 */
async function invoke(payload) {
  /** @type {import('@aws-sdk/client-lambda').LambdaClient} */
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
        console.log(
          'Invoking Discord interaction handler, returning waiting response'
        )
        try {
          await invoke(event)
        } catch (error) {
          console.warn('Error invoking discord interaction handler', error)
        }
        return {
          type: 5,
        }
      }
    }
  }
  throw new Error('[UNAUTHORIZED] Invalid request')
}
