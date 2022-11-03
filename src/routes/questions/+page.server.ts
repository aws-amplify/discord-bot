import { prisma } from '$lib/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const questions = await prisma.question.findMany({
    where: {
      guildId: locals.session.guild,
    },
    select: {
      id: true,
      title: true,
      isSolved: true,
      channelName: true,
    },
  })

  return { questions }
}
