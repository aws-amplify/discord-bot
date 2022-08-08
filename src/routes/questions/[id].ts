import { prisma } from '$lib/db'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
  const question = await prisma.question.findUnique({
    where: {
      id: params.id,
    },
  })

  if (question) {
    return {
      status: 200,
      body: { question },
    }
  }

  return {
    status: 404,
  }
}
