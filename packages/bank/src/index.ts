import * as giverole from '@hey-amplify/command-giverole'
import { staticCommandsData } from '@hey-amplify/command-static'
import { createDiscordCommandBank } from './Bank.js'

export * from './Bank.js'
export * from './Command.js'

const validCommandNameRegex = /^[\w-]{1,32}$/
// TODO: filter on command name regex to prevent sync errors
export function createStaticCommands(data) {
  return Object.entries(data).map(
    ([staticCommandName, staticCommandConfig]: [string, any]) => {
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
}

const commands = [giverole]
export const bank = createDiscordCommandBank([
  ...commands,
  ...createStaticCommands(staticCommandsData),
])
