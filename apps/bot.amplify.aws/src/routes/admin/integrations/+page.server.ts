import { prisma } from '$lib/db'
import { FEATURE_TYPES } from '$lib/constants'
import { createIntegrationHrefFromCode } from '../breadcrumbs'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const integrations = await prisma.configurationFeature.findMany({
    where: {
      configurationId: locals.session.guild,
      feature: {
        type: {
          code: FEATURE_TYPES.INTEGRATION,
        },
      },
    },
    select: {
      feature: true,
    },
  })
  return {
    integrations: integrations.map((integration) => ({
      ...integration.feature,
      href: createIntegrationHrefFromCode(integration.feature.code),
    })),
  }
}
