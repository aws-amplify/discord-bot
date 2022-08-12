import { PrismaClient } from '@prisma/client'
import { ACCESS_LEVELS } from './constants'

export const prisma = new PrismaClient()

// await prisma.$disconnect()
export async function init() {
  console.time('[database] init')

  for (const level of Object.values(ACCESS_LEVELS)) {
    await prisma.accessLevel.upsert({
      where: {
        name: level,
      },
      create: {
        name: level,
      },
      update: {},
    })
  }
  console.timeEnd('[database] init')
}
