import parseCommands from 'command-line-commands'
import parseArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import c from 'picocolors'
import * as createSecretsCommand from './create-secrets.js'

const commands = [createSecretsCommand]
const { command, argv } = parseCommands(
  [null].concat(commands.map((cmd) => cmd.name))
)

// console.log('================= DEBUG =================')
// console.log('command: %s', command)
// console.log('argv:    %s', JSON.stringify(argv))
// console.log('=========================================')

const sections = [
  {
    header: '@hey-amplify/scripts',
    content: 'Collection of scripts',
  },
  {
    header: 'Commands',
    content: commands.map(({ name, description }) => ({
      name,
      description,
    })),
  },
]
const usage = commandLineUsage(sections)

if (!command) {
  console.log(usage)
  process.exit(1)
}

const cmd = commands.find((cmd) => cmd.name === command)
try {
  await cmd.handler(parseArgs(cmd.options, { argv }))
} catch (error) {
  console.error(c.red(error))
}
