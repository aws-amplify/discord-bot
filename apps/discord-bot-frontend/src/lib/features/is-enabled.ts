import { prisma } from '$lib/db'
import { FEATURE_CODES } from '$lib/constants'

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
