import cookie from 'cookie'
import { z } from 'zod'
import { GUILD_COOKIE } from '$lib/constants'
import type { RequestHandler } from '@sveltejs/kit'

const schema = z.object({
  guildId: z.string().min(1),
})

export const POST: RequestHandler = async ({ request, locals, url }) => {
  let guildId
  let redirect
  try {
    const data = await request.formData()
    guildId = data.get('guild')
    redirect = data.get('redirect') || '/'
  } catch (error) {
    return new Response('Invalid FormData', { status: 400 })
  }
  if (!guildId) {
    return new Response('Invalid request', { status: 400 })
  }

  if (guildId !== locals.session.guild) {
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
