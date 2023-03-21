import { prisma } from '$lib/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  const { code } = params
  const integration = await prisma.configurationFeature.findUnique({
    where: {
      configurationId_featureCode: {
        configurationId: locals.guild,
        featureCode: code.toUpperCase(),
      },
    },
    select: {
      feature: true,
    },
  })
  return {
    configurationId: locals.guild,
    integration: integration?.feature,
  }
}
