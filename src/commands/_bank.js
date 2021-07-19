import { readFileSync } from 'fs'

import * as hello from './hello.js'
import * as staff from './staff.js'

const staticCommandsData = JSON.parse(
  readFileSync(new URL('./static-commands.json', import.meta.url), 'utf-8')
)
// TODO: filter on command name regex to prevent sync errors
const staticCommands = Object.entries(staticCommandsData).map(
  ([staticCommandName, staticCommandConfig]) => {
    return {
      config: {
        name: staticCommandName,
        ...staticCommandConfig,
      },
      handler: (context) => {
        const { options } = context.data
        let returnValue = staticCommandConfig.return
        if (staticCommandConfig.options && options) {
          for (let option of options) {
            const { name, value } = option
            const staticOption = staticCommandConfig.options.find(
              (staticOption) => staticOption.name === name
            )
            const staticChoice = staticOption.choices.find(
              (staticChoice) => staticChoice.value === value
            )
            returnValue = staticChoice?.return
          }
        }
        return returnValue ?? 'Something went wrong.'
      },
    }
  }
)

const commands = [hello, staff, ...staticCommands]

const validCommandNameRegex = /^[\w-]{1,32}$/
export const bank = new Map(
  commands.map((command) => [command.config.name, command])
)
