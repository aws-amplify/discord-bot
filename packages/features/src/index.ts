import { FEATURE_CODES, FEATURE_TYPES } from '@hey-amplify/constants'
import type { Prisma } from '@hey-amplify/prisma-client'

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
