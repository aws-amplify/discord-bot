import { OAuth2Routes } from 'discord-api-types/v10'
import { serialize } from 'cookie'

const DISCORD_CLIENT_ID = process.env.DISCORD_AUTH_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_AUTH_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_AUTH_REDIRECT_URI

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(event) {
  const discord_refresh_token = event.url.searchParams.get('code')
  if (!discord_refresh_token) {
    return {
      body: JSON.stringify({ error: 'No refresh token found' }),
      status: 500,
    }
  }

  // initializing data object to be pushed to Discord's token endpoint.
  // quite similar to what we set up in callback.js, expect with different grant_type.
  const payload = {
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    redirect_uri: DISCORD_REDIRECT_URI,
    refresh_token: discord_refresh_token,
    scope: 'identify email guilds',
  }

  // performing a Fetch request to Discord's token endpoint
  const request = await fetch(OAuth2Routes.tokenURL, {
    method: 'POST',
    body: new URLSearchParams(payload),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const response = await request.json()

  if (response.error) {
    return {
      body: JSON.stringify({ error: response.error }),
      status: 500,
    }
  }

  // redirect user to front page with cookies set
  const access_token_expires_in = new Date(Date.now() + response.expires_in) // 10 minutes
  const refresh_token_expires_in = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ) // 30 days

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
    },
    status: 200,
    body: JSON.stringify({ discord_access_token: response.access_token }),
  }
}
