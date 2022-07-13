import { prisma } from '$lib/db'

export async function get() {
  const questions = await prisma.question.findMany()

  if (questions?.length) {
    return {
      status: 200,
      body: { questions },
    }
  }

  return {
    status: 500,
  }
}
