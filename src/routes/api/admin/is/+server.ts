import type { RequestHandler } from '@sveltejs/kit'

/**
 * Sample route for verification testing
 */
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.session?.user?.isAdmin) {
    return new Response('Forbidden', { status: 403 })
  }

  return new Response('ok')
}
