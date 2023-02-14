import { FEATURE_TYPES } from '$lib/constants'
import { error } from '@sveltejs/kit'
import {
  Routes,
  type RESTGetAPIApplicationGuildCommandsResult,
  type RESTGetAPIGuildRolesResult,
  type RESTGetAPIApplicationCommandResult,
} from 'discord-api-types/v10'
import { env } from '$env/dynamic/private'
import {
  commands as bank,
  type Command as CommandType,
} from '@hey-amplify/discord'
import { prisma } from '$lib/db'
import { api } from '../api/_discord'
import { tabs } from './tabs'
import type {
  Configuration,
  Guild,
  DiscordRole,
  Feature,
} from '@hey-amplify/prisma-client'
import type { PageServerLoad } from './$types'

type AdminPageReturn = {
  commands: Array<
    CommandType & { registration: RESTGetAPIApplicationCommandResult }
  >
  discord: {
    /**
     * The Discord Guild instance
     */
    guild: Guild
    /**
     * List of roles from the Discord API
     */
    roles: RESTGetAPIGuildRolesResult
  }
  configure: {
    config: Configuration & {
      roles: DiscordRole[]
    }
    /**
     * List of features configured for the guild
     */
    features: Feature[]
  }
  /**
   * List of available features from Database
   */
  features: ({
    enabled: boolean
  } & Feature)[]
  /**
   * Tab ID to display on load
   */
  selectedTab: number
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const commands = Array.from(bank.values())
  const guildId = locals.session.guild

  // get guild info
  const guild = (await api.get(Routes.guild(guildId))) as Guild
  // get list of roles from guild
  const roles = (await api.get(
    Routes.guildRoles(guildId)
  )) as RESTGetAPIGuildRolesResult
  // get list of commands registered to this guild
  const apiCommands = (await api.get(
    Routes.applicationGuildCommands(env.DISCORD_APP_ID, guildId)
  )) as RESTGetAPIApplicationGuildCommandsResult

  const tab = url.searchParams.get('tab')
  let selectedTab = tabs[0].id
  if (tab) {
    selectedTab =
      tabs.find((t) => t.title.toLowerCase() === tab.toLowerCase())?.id ||
      selectedTab
  }

  const config = await prisma.configuration.findUnique({
    where: { id: guildId },
    include: {
      roles: {
        select: {
          accessLevelId: true, // i.e. "name"
          discordRoleId: true,
        },
      },
      features: {
        select: {
          enabled: true,
          feature: {
            select: {
              code: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  })

  const accessLevels = await prisma.accessLevel.findMany()

  if (!locals.session?.user?.isGuildOwner && !config) {
    throw error(403)
  }

  if (!commands?.length || !roles) {
    throw error(500)
  }

  const result: AdminPageReturn = {
    commands: commands.map((c) => {
      const registration = apiCommands.find((cmd) => cmd.name === c.name)
      return {
        id: registration?.id,
        name: c.name,
        description: c.description,
        config: c.config?.toJSON?.() || c.config,
        registration,
      }
    }),
    discord: {
      guild,
      roles,
      config: JSON.parse(JSON.stringify(config)),
    },
    configure: {
      ...config,
      accessLevels,
      features: config?.features?.map((f) => ({
        enabled: f.enabled,
        ...f.feature,
      })),
    },
    integrations: await prisma.feature.findMany({
      where: {
        type: {
          code: FEATURE_TYPES.INTEGRATION,
        },
      },
    }),
    selectedTab,
  }

  return result
}
