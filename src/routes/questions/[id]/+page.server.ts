import { error } from '@sveltejs/kit'
import { prisma } from '$lib/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const question = await prisma.question.findUnique({
    where: {
      id: params.id,
    },
    select: {
      title: true,
      isSolved: true,
      url: true,
    },
  })

  if (question) {
    return { question }
  }

  error(404, 'Question not found')
}
