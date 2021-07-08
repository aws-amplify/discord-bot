import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import fetch from 'node-fetch'
import { getDiscordSecrets } from '../secrets'

export async function handler(event: APIGatewayProxyEventV2) {
  console.log('EVENT', JSON.stringify(event, null, 2))
  const secrets = await getDiscordSecrets()
  const url = `https://discord.com/api/v8/applications/${secrets?.APP_ID}/commands`
  const options = {
    headers: {
      Authorization: `Bot ${secrets?.BOT_TOKEN}`,
    },
  }

  let commands = []
  try {
    const listCommandsResponse = await fetch(url, options)
    const listCommandsData = await listCommandsResponse.json()
    commands = listCommandsData
  } catch (error) {
    console.log('Error fetching commands', error)
  }

  return {
    commands,
  }
}
