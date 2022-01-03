import { bank } from '@hey-amplify/bank'
import { registerCommand } from './registerCommand.js'

export async function syncCommands() {
  const commands = Array.from(bank.values()).map(registerCommand)
  return await Promise.allSettled(commands)
}
