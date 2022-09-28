import { Prisma } from '@prisma/client'
import { FEATURE_CODES, FEATURE_TYPES } from '$lib/constants'
import { features as commands } from '$discord/commands'

export const features: Prisma.FeatureCreateInput[] = [
  {
    code: FEATURE_CODES.GITHUB,
    name: 'GitHub',
    description:
      'Integration with GitHub to use organization membership and contributions to auto-apply roles in Discord',
    type: {
      connect: {
        code: FEATURE_TYPES.INTEGRATION,
      },
    },
  },
  ...commands.map((c) => ({
    ...c,
    type: {
      connect: {
        code: FEATURE_TYPES.COMMAND,
      },
    },
  })),
]

export const types: Prisma.FeatureTypeCreateInput[] = [
  {
    code: FEATURE_TYPES.COMMAND,
  },
  {
    code: FEATURE_TYPES.INTEGRATION,
  },
]
