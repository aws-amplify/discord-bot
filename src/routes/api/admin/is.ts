/**
 * Sample route for verification testing
 */
export async function get({ locals }) {
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
