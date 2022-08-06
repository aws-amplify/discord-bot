import { Routes } from 'discord-api-types/v10'
import { get as read } from 'svelte/store'
import { commands as bank } from '$discord/commands'
import { guild as store } from '$lib/store'
import { prisma } from '$lib/db'
import { api } from '../api/_discord'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
  const commands = Array.from(bank.values())
  // const id = read(store)
  const id = import.meta.env.VITE_DISCORD_GUILD_ID

  const guild = await api.get(Routes.guild(id))
  const roles = await api.get(Routes.guildRoles(id))

  const config = await prisma.configuration.findUnique({
    where: { id },
    include: {
      roles: true,
    },
  })

  if (!locals.session?.user?.isGuildOwner && !config) {
    return {
      status: 403,
    }
  }

  if (!commands) {
    return {
      status: 500,
    }
  }

  return {
    status: 200,
    body: {
      commands,
      configure: {
        guild,
        roles,
        config,
      },
    },
  }
}
