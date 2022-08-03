import { prisma } from '$lib/db'

export async function get() {
  const questions = await prisma.question.findMany()

  return {
    status: 200,
    body: { questions },
  }
}
