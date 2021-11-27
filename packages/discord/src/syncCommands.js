import { bank } from '@amplify-discord-bots/bank'
import { registerCommand } from './registerCommand.js'

export async function syncCommands() {
  const commands = Array.from(bank.values()).map(registerCommand)
  return await Promise.allSettled(commands)
}
