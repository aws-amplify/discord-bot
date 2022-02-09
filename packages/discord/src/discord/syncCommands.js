import { bank } from '@hey-amplify/bank'
import { registerCommandV2 } from './registerCommand.js'

export async function syncCommands() {
  const commands = Array.from(bank.values()).map(registerCommandV2)
  let result = []
  for await (let registered of commands) {
    if (registered.error) {
      console.error(
        `Error registering command ${registered.error.name}:`,
        registered.error
      )
    } else {
      result.push(registered.data)
    }
  }
  if (!result.length) {
    throw new Error('No commands registered')
  }
  return result
}
