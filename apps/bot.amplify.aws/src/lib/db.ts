import { PrismaClient } from '@hey-amplify/prisma-client'
import { ACCESS_LEVELS, FEATURE_TYPES } from './constants'
import { integrations, types as featureTypes } from '@hey-amplify/features'
import { createCommandFeatures } from '@hey-amplify/discord'

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
  // initialize feature integrations
  for (const integration of integrations) {
    const toUpsert = {
      name: integration.name,
      description: integration.description,
      code: integration.code,
      type: {
        connect: {
          code: integration.type,
        },
      },
    }
    await prisma.feature.upsert({
      where: {
        code: integration.code,
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
