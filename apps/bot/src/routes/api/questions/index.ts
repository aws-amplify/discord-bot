import { prisma } from '$lib/db'

export async function get(event) {
  return {
    status: 200,
    body: JSON.stringify(await prisma.question.findMany()),
  }
}
