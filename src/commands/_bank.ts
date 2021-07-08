import { basename, extname } from 'path'
import { sync as glob } from 'fast-glob'
import { Command } from './_command'

import * as hello from './hello'

const commands = [hello]

// let commands: [string, Promise<Command>] = glob('./*.ts', {
//   cwd: __dirname,
//   ignore: ['./_*.ts'],
// }).map((path) => [basename(path, extname(path)), () => import(path)])

export const bank = new Map(
  commands.map((command) => [command.config.name, command])
)
