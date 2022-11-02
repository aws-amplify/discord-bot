import { type Prisma } from '@prisma/client'
import { FEATURE_CODES, FEATURE_TYPES } from '$lib/constants'

export const integrations = [
  {
    code: FEATURE_CODES.GITHUB,
    name: 'GitHub',
    description:
      'Integration with GitHub to use organization membership and contributions to auto-apply roles in Discord',
    type: FEATURE_TYPES.INTEGRATION,
  },
]

export const types: Prisma.FeatureTypeCreateInput[] = [
  {
    code: FEATURE_TYPES.COMMAND,
  },
  {
    code: FEATURE_TYPES.INTEGRATION,
  },
]
