import { error } from '@sveltejs/kit'
import { Routes } from 'discord-api-types/v10'
import { commands as bank } from '$discord/commands'
import { prisma } from '$lib/db'
import { api } from '../api/_discord'
import type { Configuration, Guild, DiscordRole } from '@prisma/client'
import type {
  RESTGetAPIGuildRolesResult,
  RESTGetAPIApplicationCommandResult,
} from 'discord-api-types/v10'
import type { Command as CommandType } from '$discord/commands'
import type { PageServerLoad } from './$types'

type AdminPageReturn = {
  commands: Array<
    CommandType & { registration: RESTGetAPIApplicationCommandResult }
  >
  configure: {
    config: Configuration & {
      roles: DiscordRole[]
    }
    guild: Guild
    roles: RESTGetAPIGuildRolesResult
  }
}

export const load: PageServerLoad = async ({ locals }) => {
  const commands = Array.from(bank.values())
  const id = import.meta.env.VITE_DISCORD_GUILD_ID

  const guild = (await api.get(Routes.guild(id))) as Guild
  const roles = (await api.get(
    Routes.guildRoles(id)
  )) as RESTGetAPIGuildRolesResult

  const config = await prisma.configuration.findUnique({
    where: { id },
    include: {
      roles: {
        select: {
          accessLevelId: true, // i.e. "name"
          discordRoleId: true,
        },
      },
    },
  })

  const accessLevels = await prisma.accessLevel.findMany()

  if (!locals.session?.user?.isGuildOwner && !config) {
    throw error(403)
  }

  if (!commands || !roles) {
    throw error(500)
  }

  const result: AdminPageReturn = {
    commands: commands.map((c) =>
      Object.assign(
        {},
        {
          name: c.name,
          description: c.description,
          config: c.config?.toJSON?.() || c.config,
          registration: c.registration,
        }
      )
    ),
    configure: {
      accessLevels,
      guild,
      roles,
      config: JSON.stringify(config),
    },
  }

  return result
}
