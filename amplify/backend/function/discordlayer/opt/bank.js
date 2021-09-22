const staticCommandsData = require('./commands/static-commands.json')

const validCommandNameRegex = /^[\w-]{1,32}$/
// TODO: filter on command name regex to prevent sync errors
const createStaticCommands = (data) =>
  Object.entries(data).map(([staticCommandName, staticCommandConfig]) => {
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
  })

function createBank({ staticCommandsData = [], commands = [] }) {
  // TODO: validate command name
  // TODO: ensure duplicates are not added -- static commands do not get precedence
  return new Map(
    [...commands, ...createStaticCommands(staticCommandsData)].map(
      (command) => [command.config.name, command]
    )
  )
}

const commands = [
  [
    'hello',
    {
      config: {
        name: 'hello',
        description: 'say hello',
      },
      handler: async (event) => 'Hello, World!',
    },
  ],
  ...[giverole].map((command) => [command.config.name, command]),
]

exports.bank = createBank({ staticCommandsData, commands })
