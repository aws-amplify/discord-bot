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

export const components = [
  {
    code: FEATURE_CODES.AUDIT_LOG,
    name: 'Audit Log',
    description:
      'A component that logs things to a Discord channel for auditing purposes',
    type: FEATURE_TYPES.COMPONENT,
  },
]

export const types: Prisma.FeatureTypeCreateInput[] = Object.values(
  FEATURE_TYPES
).map((code) => ({ code }))
