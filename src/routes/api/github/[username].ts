import { Octokit } from '@octokit/rest'
import type { RequestHandler } from '@sveltejs/kit'
import { authenticate } from '../../dashboard/index'

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
          'Content-Type': 'application/json',
        },
        status: 200,
        body: data.name,
      }
  } catch (error) {
    console.error(`User not found: ${error.message}`)
  }
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 204,
    body: '',
  }
}
