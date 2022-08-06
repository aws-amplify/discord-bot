import { prisma } from '$lib/db'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
  const questions = await prisma.question.findMany()

  return {
    status: 200,
    body: { questions },
  }
}
