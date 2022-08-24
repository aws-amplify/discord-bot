import { prisma } from '$lib/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const questions = await prisma.question.findMany()

  return { questions }
}
