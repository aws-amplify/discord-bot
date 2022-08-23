import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import type { RequestHandler } from '@sveltejs/kit'

async function authenticate() {
  const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  })
  try {
    const { token } = await auth({
      type: 'installation',
      installationId: process.env.GITHUB_INSTALLATION_ID,
    })
    return token
  } catch (err) {
    console.error(`Error fetching installation token: ${err}`)
  }
  return null
}


export const GET: RequestHandler = async ({ params }) => {

  try {
    const { username } = params
    const token = await authenticate()
    const octokit = new Octokit({
      auth: `token ${token}`,
    })
    const { data } = await octokit.request(`GET /users/${username}`, {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    if (data?.name)
      return {
        headers: {
          'content-type': 'text/html; charset=UTF-8',
        },
        body: data.name,
      }
  } catch (error) {
    console.error(`User not found: ${error.message}`)
  }
  return {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
    },
    body: '',
  }
}
