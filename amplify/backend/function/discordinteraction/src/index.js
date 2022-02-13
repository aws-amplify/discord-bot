import { loadSecrets } from '@hey-amplify/support'
import { handler as interact } from './interact.js'

let secretsLoaded = false

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  console.log('EVENT:', JSON.stringify(event))
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  try {
    event.body = JSON.parse(event.body)
    return {
      statusCode: 200,
      body: JSON.stringify(await interact(event)),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}
