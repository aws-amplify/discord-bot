import { prisma } from '$lib/db'

export async function get() {
  const questions = await prisma.question.findMany()

  return {
    status: questions?.length ? 200 : 204,
    body: { questions },
  }
}
