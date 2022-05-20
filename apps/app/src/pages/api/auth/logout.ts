/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(req) {
  console.log('redirect to / with cleared cookies')
  return {
    headers: {
      'set-cookie': [
        `discord_access_token=deleted; Path=/; Max-Age=-1`,
        `discord_refresh_token=deleted; Path=/; Max-Age=-1`,
      ],
      Location: '/',
    },
    status: 302,
  }
}
