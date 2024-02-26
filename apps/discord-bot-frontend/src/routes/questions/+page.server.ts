import type { PageServerLoad } from './$types'
import { prisma } from '$lib/db'

export const load: PageServerLoad = async () => {
  const questions = await prisma.question.findMany({
    where: {
      guildId: import.meta.env.VITE_DISCORD_GUILD_ID,
    },
    select: {
      id: true,
      title: true,
      isSolved: true,
      channelName: true,
      tags: {
        select: {
          name: true,
        },
      },
    },
  })

  return { questions }
}
