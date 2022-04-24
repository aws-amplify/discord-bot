import parseCommands from 'command-line-commands'
import parseArgs from 'command-line-args'
import c from 'picocolors'
import * as createSecretsCommand from './create-secrets.js'

const commands = [createSecretsCommand]
const { command, argv } = parseCommands(commands.map((cmd) => cmd.name))

// console.log('================= DEBUG =================')
// console.log('command: %s', command)
// console.log('argv:    %s', JSON.stringify(argv))
// console.log('=========================================')

const cmd = commands.find((cmd) => cmd.name === command)

try {
  await cmd.handler(parseArgs(cmd.options, { argv }))
} catch (error) {
  console.error(c.red(error))
}
