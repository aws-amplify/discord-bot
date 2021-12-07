import { bank } from '@hey-amplify/bank'
import { generateResponse } from './index.js'

export async function handleCommand({ context }) {
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

  return toRespond
}
