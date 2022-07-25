import { Routes } from 'discord-api-types/v10'
import { get as read } from 'svelte/store'
import { commands as bank } from '$discord/client'
import { guild as store } from '$lib/store'
import { prisma } from '$lib/db'
import { api } from '../api/_discord'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ locals }) {
  const commands = await bank.list()
  const id = read(store)

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
