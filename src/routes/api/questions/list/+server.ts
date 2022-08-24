import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
  const questions = await prisma.question.findMany()

  return json(
    { questions },
    {
      status: questions?.length ? 200 : 204,
    }
  )
}
