import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import type { GuildMember } from 'discord.js'

export async function isAdminOrStaff(user: GuildMember) {
  const data = await prisma.configuration.findUnique({
    where: {
      id: user.guild.id,
    },
    select: {
      roles: {
        where: {
          accessLevelId: {
            in: [ACCESS_LEVELS.ADMIN, ACCESS_LEVELS.STAFF],
          },
        },
        select: {
          discordRoleId: true,
        },
      },
    },
  })

  // if no roles are set, deny
  if (!data?.roles) return false

  return data?.roles?.some(({ discordRoleId }) =>
    user.roles.cache.has(discordRoleId)
  )
}
