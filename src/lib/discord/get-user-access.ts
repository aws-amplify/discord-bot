import { get as read } from 'svelte/store'
import { Routes } from 'discord-api-types/v10'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { guild as store } from '$lib/store'
import { api } from './index'
import type { APIGuild, APIGuildMember } from 'discord-api-types/v10'

export async function getUserAccess(guildMemberId: string) {
  // const guildId =
  const guildId = import.meta.env.VITE_DISCORD_GUILD_ID
  if (!guildId) {
    return {
      isGuildOwner: false,
      isAdmin: false,
      isStaff: false,
    }
  }
  const guild = (await api.get(Routes.guild(guildId))) as APIGuild
  const guildMember = (await api.get(
    Routes.guildMember(guildId, guildMemberId)
  )) as APIGuildMember | undefined
  if (!guildMember) {
    throw new Error(
      `Discord user ${guildMemberId} is not a member of guild ${guildId}`
    )
  }
  const isGuildOwner = guildMemberId === guild.owner_id
  const config = await prisma.configuration.findUnique({
    where: { id: guildId },
    include: {
      roles: {
        select: {
          discordRoleId: true,
          accessLevelId: true,
        },
      },
    },
  })

  if (!config) {
    return {
      isGuildOwner,
      isAdmin: isGuildOwner,
      isStaff: false,
    }
  }

  const isAdmin = config.roles.some(
    (r) =>
      r.accessLevelId === ACCESS_LEVELS.ADMIN &&
      guildMember.roles.includes(r.discordRoleId)
  )
  const isStaff = config.roles.some(
    (r) =>
      r.accessLevelId === ACCESS_LEVELS.STAFF &&
      guildMember.roles.includes(r.discordRoleId)
  )

  return {
    isGuildOwner,
    isAdmin: isGuildOwner || isAdmin,
    isStaff: isStaff,
  }
}
