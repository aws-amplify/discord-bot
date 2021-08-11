import fetch from 'node-fetch'
import { verifyEvent } from './_verify.js'
import { bank } from '../commands/_bank.js'
import { generateResponse } from '../commands/_command.js'
import { secrets } from '../secrets.js'

async function handleCommand({ token, context }) {
  if (token) {
    const config = {
      method: 'POST',
      headers: {
        Authorization: `Bot ${secrets.DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }

    const somethingWentWrongResponse = '🤕 Something went wrong'
    const command = bank.get(context.data.name)
    if (!command) throw new Error(`Invalid slash command: ${context.data.name}`)
    console.log(
      `Handling command "${command?.config?.name}" for user ${context.member.user.id}`
    )

    let commandResponse
    try {
      commandResponse = await command.handler(context)
    } catch (error) {
      console.error(`Error executing command "${command?.config?.name}"`, error)
    }

    let toRespond = commandResponse ?? somethingWentWrongResponse
    if (typeof toRespond === 'string') {
      toRespond = generateResponse(toRespond)
    }

    const interactionResponseOptions = Object.assign(
      { body: JSON.stringify(toRespond) },
      config
    )

    try {
      const url = `https://discord.com/api/v8/webhooks/${secrets.DISCORD_APP_ID}/${token}`
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
  } else throw new Error('Invalid Discord interaction token')
}

export async function handler(event) {
  if (event) {
    const { type, token, ...context } = event.body
    const verified = await verifyEvent(event)
    switch (type) {
      case 1: {
        if (!verified) break
        return {
          type: 1,
        }
      }
      case 2: {
        // return "thinking" response, invoke command handler
        const invokeHandleCommand = handleCommand({ token, context })
        if (verified && invokeHandleCommand) {
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
