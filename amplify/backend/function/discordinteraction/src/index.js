import { handler as interact } from '@hey-amplify/handler-interact'

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  console.log('EVENT:', JSON.stringify(event))
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
