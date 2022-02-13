import { handleCommand, createAPI } from '@hey-amplify/discord'
import { loadSecrets } from '@hey-amplify/support'

async function respond({ token, payload }) {
  const api = createAPI(process.env.DISCORD_BOT_TOKEN)
  const url = `/webhooks/${process.env.DISCORD_APP_ID}/${token}`
  const response = await api.post(url, payload)
  if (response.error) throw response.error.message
  return response
}

let secretsLoaded = false

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
export async function handler(event) {
  console.log('EVENT:', JSON.stringify(event))
  if (!secretsLoaded && (await loadSecrets())) secretsLoaded = true
  // event.body = JSON.parse(event.body)
  const { token } = event.body
  try {
    const response = await respond({
      token,
      payload: await handleCommand({ context: event.body }),
    })
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.log('ERROR:', error)
    // await respond({ token, payload: error.message })
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}
