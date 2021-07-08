import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import fetch from 'node-fetch'
import type { RequestInit } from 'node-fetch'
import { getDiscordSecrets } from '../secrets'
import type { SlashCommandOptions } from '../commands/_command'
import { bank } from '../commands/_bank'

/*
json = {
    "name": "blep",
    "description": "Send a random adorable animal photo",
    "options": [
        {
            "name": "animal",
            "description": "The type of animal",
            "type": 3,
            "required": True,
            "choices": [
                {
                    "name": "Dog",
                    "value": "animal_dog"
                },
                {
                    "name": "Cat",
                    "value": "animal_cat"
                },
                {
                    "name": "Penguin",
                    "value": "animal_penguin"
                }
            ]
        },
        {
            "name": "only_smol",
            "description": "Whether to show only baby animals",
            "type": 5,
            "required": False
        }
    ]
}
*/

// https://discord.com/developers/docs/interactions/slash-commands#registering-a-command
export async function handler(event: APIGatewayProxyEventV2) {
  console.log('EVENT', JSON.stringify(event, null, 2))
  const secrets = await getDiscordSecrets()
  const url = `https://discord.com/api/v8/applications/${secrets?.APP_ID}/commands`
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bot ${secrets?.BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  const failed = []
  const success = []

  console.log(`Registering bank for ${bank.size} commands`)
  for (const [commandName, command] of bank.entries()) {
    if (!command) {
      failed.push(commandName)
      continue
    }
    const { name, description }: SlashCommandOptions = command.config
    const registrationOptions = Object.assign(
      { body: JSON.stringify({ name, description }) },
      options
    )

    try {
      const registrationResponse = await fetch(url, registrationOptions)
      const registrationData = await registrationResponse.json()
      if (
        registrationResponse.status !== 201 &&
        registrationResponse.status !== 200
      ) {
        throw new Error(
          `Unable to register ${commandName} (status: ${
            registrationResponse.status
          }): ${JSON.stringify(registrationData, null, 2)}`
        )
      }
      console.log(
        `Registration data for ${commandName} - ${registrationResponse.status}`,
        JSON.stringify(registrationData, null, 2)
      )
      success.push(registrationData)
    } catch (error) {
      console.log('Error registering slash command', error)
      failed.push(commandName)
    }
  }

  return {
    failed,
    success,
  }
}
