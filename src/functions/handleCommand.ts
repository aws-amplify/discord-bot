import fetch from 'node-fetch'
import { getDiscordSecrets } from '../secrets'
import { bank } from '../commands/_bank'
import { generateResponse } from '../commands/_command'
import type { SlashCommandResponse } from '../commands/_command'
import type { Embed } from 'slash-commands'

export async function handler(event: any): Promise<void> {
  console.log('COMMAND EVENT', JSON.stringify(event, null, 2))
  const secrets = await getDiscordSecrets()
  const { token, member, guild_id, data } = JSON.parse(event.body)
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bot ${secrets?.BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  const somethingWentWrongResponse = 'Something went wrong'
  const command = bank.get(data.name)
  console.log(
    `Handling command ${command?.config?.name} for user ${member.user.id}`
  )
  const commandResponse: SlashCommandResponse = await command.handler()

  let toRespond = commandResponse ?? somethingWentWrongResponse
  if (typeof commandResponse === 'string') {
    toRespond = generateResponse(commandResponse)
  }

  const interactionResponseOptions = Object.assign(
    { body: JSON.stringify(toRespond) },
    config
  )

  try {
    console.log('Responding...')
    const url = `https://discord.com/api/v8/webhooks/${secrets?.APP_ID}/${token}`
    const interactionResponse = await fetch(url, interactionResponseOptions)
    if (interactionResponse.status !== 200) {
      console.log(
        'Error sending response',
        JSON.stringify(interactionResponse, null, 2)
      )
    }
  } catch (error) {
    console.log('Error sending response', error)
  }
}
