import { type RequestHandler } from '@sveltejs/kit'
import cookie from 'cookie'
import { GUILD_COOKIE } from '$lib/constants'

export const POST: RequestHandler = async ({ request, locals }) => {
  let guildId
  let redirect
  try {
    const data = await request.formData()
    guildId = data.get('guild') as string
    redirect = (data.get('redirect') as string) || '/'
  } catch (error) {
    return new Response('Invalid FormData', { status: 400 })
  }
  if (!guildId) {
    return new Response('Invalid request', { status: 400 })
  }

  if (guildId !== locals.guildId) {
    const headers = new Headers()
    headers.set(
      'Set-Cookie',
      cookie.serialize(GUILD_COOKIE, guildId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
      })
    )
    headers.set('Location', redirect)
    return new Response('ok', { headers, status: 307 })
  }

  return new Response(undefined, { status: 500 })
}
