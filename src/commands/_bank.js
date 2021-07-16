import { readFileSync } from 'fs'
import * as hello from './hello.js'

const staticCommandsData = JSON.parse(
  readFileSync(new URL('./static-commands.json', import.meta.url), 'utf-8')
)
const staticCommands = Object.entries(staticCommandsData).map(
  ([staticCommandName, staticCommandConfig]) => {
    return {
      config: {
        name: staticCommandName,
        description: staticCommandConfig.description,
      },
      handler: () => staticCommandConfig.return,
    }
  }
)
const commands = [hello, ...staticCommands]

const validCommandNameRegex = /^[\w-]{1,32}$/
export const bank = new Map(
  commands.map((command) => [command.config.name, command])
)
