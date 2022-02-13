import { verifyEvent, handleCommand } from '@hey-amplify/discord'

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  if (event?.body && (await verifyEvent(event))) {
    const { type, ...context } = event.body
    switch (type) {
      case 1: {
        return {
          type: 1,
        }
      }
      case 2: {
        return {
          type: 4,
          data: await handleCommand({ context }),
        }
      }
    }
  }
  throw new Error('[UNAUTHORIZED] Invalid request')
}
