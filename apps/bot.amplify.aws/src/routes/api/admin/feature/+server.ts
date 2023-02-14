import { prisma } from '$lib/db'
import type { FEATURE_CODES } from '$lib/constants'
import type { RequestHandler } from '@sveltejs/kit'

type Payload = {
  /**
   * ID of the server configuration to update
   */
  configurationId: string
  /**
   * The feature code to enable/disable
   */
  code: keyof typeof FEATURE_CODES
  /**
   * Whether to enable or disable the feature (true = enable)
   */
  enabled: boolean
}

export const POST: RequestHandler = async ({ request }) => {
  let body: Payload
  try {
    /**
     * @TODO migrate to FormData
     */
    body = await request.json()
  } catch (error) {
    // reject if body is not valid JSON
    return new Response('Invalid JSON body', { status: 400 })
  }
  if (!Object.keys(body || {}).length) {
    // reject if body does not contain any keys
    return new Response('Invalid JSON body', { status: 400 })
  }

  /**
   * @TODO validate body with zod??
   */
  const { configurationId, code, enabled } = body
  if (!configurationId || !code || enabled === undefined) {
    return new Response('Invalid request', { status: 400 })
  }

  try {
    const updated = await prisma.configuration.update({
      where: {
        id: body.configurationId,
      },
      data: {
        features: {
          upsert: {
            where: {
              configurationId_featureCode: {
                configurationId: body.configurationId,
                featureCode: body.code,
              },
            },
            create: {
              feature: {
                connect: {
                  code: body.code,
                },
              },
              enabled: body.enabled,
            },
            update: {
              feature: {
                connect: {
                  code: body.code,
                },
              },
              enabled: body.enabled,
            },
          },
        },
      },
    })
    return new Response(JSON.stringify(updated), { status: 200 })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}
