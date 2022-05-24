import { prisma } from '../../../db'

export async function get(event) {
  return {
    status: 200,
    body: JSON.stringify(await prisma.question.findMany()),
  }
}
