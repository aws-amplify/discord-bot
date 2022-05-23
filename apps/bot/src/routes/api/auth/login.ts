const DISCORD_CLIENT_ID = process.env.DISCORD_AUTH_CLIENT_ID
const DISCORD_REDIRECT_URI = process.env.DISCORD_AUTH_REDIRECT_URI
const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  DISCORD_REDIRECT_URI
)}&response_type=code&scope=identify%20email%20guilds`

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get() {
  return {
    headers: { Location: DISCORD_ENDPOINT },
    status: 302,
  }
}
