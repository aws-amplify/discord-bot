const { createBank } = require('@amplify-discord-bots/bank')
const giverole = require('@amplify-discord-bots/command-giverole')
const staticCommandsData = require('./static-commands.json')

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
