import * as glob from 'fast-glob'
import type { IDiscordCommand, DiscordCommand } from './Command.js'
import { api, DiscordAPIRequestResponse } from './api.js'
import { generateResponse } from './support.js'

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
            for (const option of options) {
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

export class DiscordCommandMap extends Map<string, DiscordCommand> {
  constructor(commands: DiscordCommand[]) {
    super()
    return new Map(commands.map((command) => [command.name, command]))
  }
}

export interface IDiscordCommandBank extends DiscordCommandMap {
  // register(command: IDiscordCommand): Promise<DiscordAPIRequestResponse>
  handle(context): Promise<string>
  register(
    command: DiscordCommand,
    context: any
  ): Promise<DiscordAPIRequestResponse>
}

export class DiscordCommandBank
  extends DiscordCommandMap
  implements IDiscordCommandBank
{
  // TODO: validate command name
  // TODO: ensure duplicates are not added -- static commands do not get precedence
  constructor(commands: DiscordCommand[]) {
    super(commands)
  }

  public async register(command, { guildId } = { guildId: null }) {
    let url = `/applications/${process.env.DISCORD_APP_ID}`
    if (guildId) {
      url += `/guilds/${guildId}`
    }
    url += '/commands'

    // TODO: add whether command was added or updated based on status
    return api.post(url, command)
  }

  // public async syncCommands() {
  //   // @ts-ignore
  //   const commands = Array.from(bank.values()).map(registerCommand)
  //   let result = [] as any
  //   for await (let registered of commands as any[]) {
  //     if (registered.error) {
  //       console.error(
  //         `Error registering command ${registered.error.name}:`,
  //         registered.error
  //       )
  //     } else {
  //       result.push(registered.data)
  //     }
  //   }
  //   if (!result.length) {
  //     throw new Error('No commands registered')
  //   }
  //   return result
  // }

  // public async listCommands() {
  //   const registeredCommands = await this.get(
  //     `/applications/${process.env.DISCORD_APP_ID}/commands`
  //   )
  //   const banked = Array.from(bank.values()).map(
  //     (command: any) => command.config
  //   )
  //   let commands = [] as any
  //   for (let command of banked) {
  //     const registered = registeredCommands.data.find(
  //       (c) => c.name === command.name
  //     )
  //     if (registered) {
  //       command.registration = registered
  //     }
  //     commands.push(command)
  //   }
  //   return commands
  // }

  // public async deleteCommand(commandId, { guildId }) {
  //   let url = `/applications/${process.env.DISCORD_APP_ID}`
  //   if (guildId) {
  //     url += `/guilds/${guildId}`
  //   }
  //   url += `/commands/${commandId}`

  //   return this.delete(url)
  // }

  public async handle({ context }) {
    const somethingWentWrongResponse = '🤕 Something went wrong'
    const command = this.get(context.data.name)
    if (!command) throw new Error(`Invalid slash command: ${context.data.name}`)
    console.log(
      `Handling command "${command?.name}" for user ${context.member.user.id}`
    )

    let commandResponse
    try {
      commandResponse = await command.handler(context)
    } catch (error) {
      console.error(`Error executing command "${command?.name}"`, error)
    }

    let toRespond = commandResponse ?? somethingWentWrongResponse
    if (typeof toRespond === 'string') {
      toRespond = generateResponse(toRespond)
    }

    return toRespond
  }
}

function createDiscordCommandBank(
  commands: DiscordCommand[] | IDiscordCommand[] | any
): DiscordCommandBank {
  return new DiscordCommandBank(commands)
}

export async function createBank() {
  // TODO: add support for other command dirs
  const commandsDirectory = new URL('commands', import.meta.url).pathname
  const commandPaths = await glob(['!(_*|*.d).(js|ts)'], {
    onlyFiles: true,
    cwd: commandsDirectory,
    absolute: true,
  })

  const commands: any[] = [] // TODO: type
  for (const commandPath of commandPaths) {
    let command
    try {
      command = await import(commandPath)
    } catch (error) {
      throw new Error(`Error importing ${commandPath}`)
    }
    if (!command?.default) commands.push(command)
    else commands.push(command.default)
  }

  return createDiscordCommandBank(commands)
}

export const bank = await createBank()
