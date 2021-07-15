import * as hello from './hello.js'

const commands = [hello]

export const bank = new Map(
  commands.map((command) => [command.config.name, command])
)
