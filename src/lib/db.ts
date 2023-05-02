import { PrismaClient } from '@prisma/client'
import { ACCESS_LEVELS, FEATURE_TYPES } from './constants'
import {
  components,
  integrations,
  types as featureTypes,
} from './features/index'
import { createCommandFeatures } from './discord/commands'

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
  // initialize feature integrations and components
  for (const feature of [...integrations, ...components]) {
    const toUpsert = {
      name: feature.name,
      description: feature.description,
      code: feature.code,
      type: {
        connect: {
          code: feature.type,
        },
      },
    }
    await prisma.feature.upsert({
      where: {
        code: feature.code,
      },
      create: toUpsert,
      update: toUpsert,
    })
  }
  // initialize feature commands
  for (const command of createCommandFeatures()) {
    const toUpsert = {
      ...command,
      type: {
        connect: {
          code: FEATURE_TYPES.COMMAND,
        },
      },
    }
    await prisma.feature.upsert({
      where: {
        code: toUpsert.code,
      },
      create: toUpsert,
      update: toUpsert,
    })
  }
  console.timeEnd(DB_INIT_MESSAGE)
}
