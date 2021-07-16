import { readFileSync } from 'fs'
import * as hello from './hello.js'

const staticCommandsData = JSON.parse(
  readFileSync(new URL('./static-commands.json', import.meta.url), 'utf-8')
)
const staticCommands = Object.entries(staticCommandsData).map(
  ([staticCommandName, staticCommandReturnValue]) => {
    return {
      config: {
        name: staticCommandName,
      },
      handler: () => staticCommandReturnValue,
    }
  }
)
const commands = [hello, ...staticCommands]

export const bank = new Map(
  commands.map((command) => [command.config.name, command])
)
