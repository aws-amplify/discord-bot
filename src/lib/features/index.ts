import { Prisma } from '@prisma/client'
import { FEATURE_CODES } from '$lib/constants'

export const features: Prisma.FeatureCreateInput[] = [
  {
    code: FEATURE_CODES.GITHUB,
    name: 'GitHub',
    description:
      'Integration with GitHub to use organization membership and contributions to auto-apply roles in Discord',
  },
]
