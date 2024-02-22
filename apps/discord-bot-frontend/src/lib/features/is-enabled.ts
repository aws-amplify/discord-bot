import type { FEATURE_CODES } from '$lib/constants'
import { prisma } from '$lib/db'

export const isEnabled = async (
  code: keyof typeof FEATURE_CODES,
  configurationId: string
) => {
  const [feature] = await prisma.configuration
    .findUnique({
      where: {
        id: configurationId,
      },
      select: {
        features: {
          where: {
            feature: {
              code,
            },
          },
        },
      },
    })
    .features()
  return feature?.enabled || false
}
