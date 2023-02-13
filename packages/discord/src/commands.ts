import {
  Routes,
  type RESTPostAPIApplicationGuildCommandsResult,
  type RESTGetAPIApplicationGuildCommandResult,
  type RESTGetAPIApplicationGuildCommandsResult,
} from 'discord-api-types/v10'
import {
  type SlashCommandBuilder,
  type ContextMenuCommandBuilder,
} from '@discordjs/builders'
import {
  type ChatInputCommandInteraction,
  type ContextMenuCommandInteraction,
  type InteractionReplyOptions,
} from 'discord.js'
import { prisma } from './prisma.js'
import { FEATURE_TYPES } from '@hey-amplify/constants'
import * as admin from './commands/admin.js'
import * as contribute from './commands/contribute.js'
import * as github from './commands/github.js'
import * as giverole from './commands/giverole.js'
import * as login from './commands/login.js'
import * as selectAnswer from './commands/select-answer.js'
import * as thread from './commands/thread.js'
import * as q from './commands/q.js'
import { api } from './api.js'

export type Command = {
  name: string
  code: string
  description: string
  config: SlashCommandBuilder | ContextMenuCommandBuilder
  handle: (
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
  ) => Promise<InteractionReplyOptions | string | undefined | void>
}

function createCommandCode(name: string) {
  return `COMMAND_${name.replace('-', '').toUpperCase()}`
}

function createCommandsMap(commands: any[]) {
  const map = new Map()
  for (const command of commands) {
    const stored = {
      name: command.config.name,
      code: createCommandCode(command.config.name),
      description: command.config?.description,
      config: command.config,
      _handler: command.handler,
      handle: async (
        interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
      ) => {
        const somethingWentWrongResponse = '🤕 Something went wrong'
        let response
        try {
          response = await command.handler(interaction)
        } catch (error) {
          console.error(
            `Error handling command ${command.config.name} for ${interaction.user.id}:`,
            error
          )
        }

        let toRespond = response
        if (!response) {
          console.warn(
            `No response received from command handler for ${command.config.name}`
          )
          toRespond = { content: somethingWentWrongResponse }
        }

        if (interaction.deferred) {
          return await interaction.editReply(toRespond)
        }
        return await interaction.reply(toRespond)
      },
    }
    map.set(command.config.name, stored)
  }
  return map
}

export const commands = createCommandsMap([
  admin,
  contribute,
  github,
  giverole,
  login,
  selectAnswer,
  thread,
  q,
])

const c = commands

export function createCommandFeatures(
  commands: Command[] = Array.from(c.values())
) {
  return commands.map((c) => ({
    code: c.code,
    name: c.name,
    description: c.description || `Command ${c.name}`,
  }))
}

/**
 * @TODO - save changes in database (e.g. toggle `enabled`)
 */
export async function registerCommands(
  commands: Command[] = Array.from(c.values()),
  guild: string
): Promise<RESTPostAPIApplicationGuildCommandsResult | undefined> {
  const payload = commands.map((c) => c.config.toJSON())

  let response
  try {
    console.log(`Started refreshing guild slash (/) commands for ${guild}.`)
    response = (await api.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guild
      ),
      payload
    )) as RESTPostAPIApplicationGuildCommandsResult
    console.log(
      `Successfully refreshing guild slash (/) commands for ${guild}.`
    )
  } catch (error) {
    console.error(
      `Error refreshing guild slash (/) commands for ${guild}`,
      error
    )
    throw new Error('Error registering commands')
  }
  // save changes in database
  for (const command of commands) {
    try {
      console.log(`Started saving feature ${command.name} for ${guild}.`)
      /**
       * @TODO updateMany?
       */
      await prisma.configurationFeature.update({
        where: {
          configurationId_featureCode: {
            configurationId: guild,
            featureCode: command.code,
          },
        },
        data: {
          enabled: true,
        },
      })
    } catch (error) {
      console.error(`Error saving feature ${command.name} for ${guild}.`, error)
      throw new Error(`Error saving feature ${command.name} for ${guild}.`)
    }
  }
  return response
}

export async function registerCommand(
  command: Command,
  guild: string
): Promise<RESTPostAPIApplicationGuildCommandsResult | undefined> {
  // const payload = command.config.toJSON()
  const payload = command.config.toJSON()
  let response
  const messaging = `registering guild slash (/) command ${command.name} for ${guild}.`
  try {
    console.log(`Started ${messaging}`)
    response = (await api.post(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guild
      ),
      payload
    )) as RESTPostAPIApplicationGuildCommandsResult
    console.log(`Successfully ${messaging}`)
  } catch (error) {
    console.error(`Error ${messaging}`, error)
    throw new Error(`Error ${messaging}`)
  }
  try {
    console.log(`Started saving feature ${command.name} for ${guild}.`)
    await prisma.configurationFeature.update({
      where: {
        configurationId_featureCode: {
          configurationId: guild,
          featureCode: command.code,
        },
      },
      data: {
        enabled: true,
      },
    })
  } catch (error) {
    console.error(`Error saving feature ${command.name} for ${guild}.`, error)
    throw new Error(`Error saving feature ${command.name} for ${guild}.`)
  }
  return response
}

/**
 * Synchronizes commands registered with Discord with the database.
 * This helps us keep track of which commands are enabled and which are not if/when the database is missing "enabled" records
 */
export async function syncRegisteredCommandsForGuild(
  guildId: string
): Promise<void> {
  const messaging = `synchronizing guild slash (/) commands for ${guildId}`
  console.info('Started', messaging)
  const storedCommands = await prisma.configurationFeature.findMany({
    where: {
      configurationId: guildId,
      feature: {
        type: {
          code: FEATURE_TYPES.COMMAND,
        },
      },
    },
  })

  let registeredCommands = []
  try {
    registeredCommands = (await api.get(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guildId
      )
    )) as RESTGetAPIApplicationGuildCommandsResult
  } catch (error) {
    console.error(
      `Error fetching registered commands for guild ${guildId}`,
      error
    )
    throw new Error('Error fetching registered commands')
  }

  const commandsToPatch = []

  for (const storedCommand of storedCommands) {
    const registeredCommand = registeredCommands.find(
      (r) => createCommandCode(r.name) === storedCommand.featureCode
    )
    // disable commands not registered but enabled in db
    if (!registeredCommand && storedCommand.enabled) {
      await prisma.configurationFeature.update({
        where: {
          id: storedCommand.id,
        },
        data: {
          enabled: false,
        },
      })
    }
    // enable commands registered but disabled in db
    if (registeredCommand && !storedCommand.enabled) {
      await prisma.configurationFeature.update({
        where: {
          id: storedCommand.id,
        },
        data: {
          enabled: true,
        },
      })
    }
    // sync commands with Discord
    if (registeredCommand && storedCommand.enabled) {
      const command = commands.get(registeredCommand.name)
      commandsToPatch.push(command.config.toJSON())
    }
  }
  // start refreshing commands with Discord
  try {
    await api.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APP_ID as string,
        guildId
      ),
      commandsToPatch
    )
  } catch (error) {
    console.error('Error refreshing commands with Discord', error)
  }
  console.info('Finished', messaging)
}

export async function unregisterCommand(commandId: string, guildId: string) {
  const registered = (await api.get(
    Routes.applicationGuildCommand(
      process.env.DISCORD_APP_ID as string,
      guildId,
      commandId
    )
  )) as RESTGetAPIApplicationGuildCommandResult
  try {
    await api.delete(
      Routes.applicationGuildCommand(
        process.env.DISCORD_APP_ID as string,
        guildId,
        commandId
      )
    )
  } catch (error) {
    throw new Error(
      `Error unregistering command ${commandId} for guild ${guildId}`
    )
  }
  try {
    await prisma.configurationFeature.update({
      where: {
        configurationId_featureCode: {
          configurationId: guildId,
          featureCode: createCommandCode(registered.name),
        },
      },
      data: {
        enabled: false,
      },
    })
  } catch (error) {
    throw new Error(
      `Error saving disabled command ${commandId} for guild ${guildId}`
    )
  }
}
