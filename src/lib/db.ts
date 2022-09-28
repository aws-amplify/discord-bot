import { PrismaClient } from '@prisma/client'
import { ACCESS_LEVELS } from './constants'
import { features, types as featureTypes } from './features/index'

export const prisma = new PrismaClient()
const DB_INIT_MESSAGE = '[database] init'

export async function init() {
  console.time(DB_INIT_MESSAGE)
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
  for (const featureType of featureTypes) {
    await prisma.featureType.upsert({
      where: featureType,
      create: featureType,
      update: {},
    })
  }
  for (const feature of features) {
    await prisma.feature.upsert({
      where: {
        code: feature.code,
      },
      create: feature,
      update: feature,
    })
  }
  console.timeEnd(DB_INIT_MESSAGE)
}
