import { prisma } from '$lib/db'

export async function get({ params }) {
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
