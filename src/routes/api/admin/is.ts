import type { RequestHandler } from '@sveltejs/kit'

/**
 * Sample route for verification testing
 */
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.session?.user?.isAdmin) {
    return {
      status: 403,
    }
  }

  return {
    status: 200,
    body: 'ok',
  }
}
