import { prisma } from '$lib/db'
import { type PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  const { code } = params
  const integration = await prisma.configurationFeature.findUnique({
    where: {
      configurationId_featureCode: {
        configurationId: locals.guildId,
        featureCode: code.toUpperCase(),
      },
    },
    select: {
      feature: true,
    },
  })
  return {
    configurationId: locals.guildId,
    integration: integration?.feature,
  }
}
