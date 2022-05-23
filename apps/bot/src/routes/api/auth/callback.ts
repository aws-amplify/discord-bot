import { OAuth2Routes } from 'discord-api-types/v10'
import { serialize } from 'cookie'
import type { RequestHandler } from '@sveltejs/kit'

const DISCORD_CLIENT_ID = process.env.DISCORD_AUTH_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_AUTH_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_AUTH_REDIRECT_URI

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(event) {
  // fetch returnCode set in the URL parameters.
  const returnCode = event.url.searchParams.get('code')

  // initializing data object to be pushed to Discord's token endpoint.
  // the endpoint returns access & refresh tokens for the user.
  const payload = {
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: DISCORD_REDIRECT_URI,
    code: returnCode,
    scope: 'identify email guilds',
  }

  // performing a Fetch request to Discord's token endpoint
  const request = await fetch(OAuth2Routes.tokenURL, {
    method: 'POST',
    body: new URLSearchParams(payload),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const response = await request.json()

  // redirect to front page in case of error
  if (response.error) {
    console.log('redirect to / due error')
    return {
      headers: { Location: '/' },
      status: 302,
    }
  }

  // redirect user to front page with cookies set
  const access_token_expires_in = new Date(Date.now() + response.expires_in) // 10 minutes
  const refresh_token_expires_in = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ) // 30 days
  console.log('redirect to / with cookies')

  const discordAccessTokenCookie = serialize(
    'discord_access_token',
    response.access_token,
    {
      path: '/',
      httpOnly: true,
      sameSite: 'Strict',
      expires: access_token_expires_in,
      secure: process.env.NODE_ENV === 'production',
    }
  )

  const discordRefreshTokenCookie = serialize(
    'discord_refresh_token',
    response.refresh_token,
    {
      path: '/',
      httpOnly: true,
      sameSite: 'Strict',
      expires: refresh_token_expires_in,
      secure: process.env.NODE_ENV === 'production',
    }
  )

  return {
    headers: {
      'access-control-expose-headers': 'Set-Cookie',
      'set-cookie': [discordAccessTokenCookie, discordRefreshTokenCookie],
      Location: '/',
    },
    status: 302,
  }
}
