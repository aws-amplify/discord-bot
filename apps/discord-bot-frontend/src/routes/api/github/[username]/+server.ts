import { createOctokit } from '$lib/github/create-octokit'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ params }) => {
  const octokit = await createOctokit()
  try {
    const { username } = params
    const { data } = await octokit.request(`GET /users/${username}`, {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    if (data?.name) {
      return new Response(data.name)
    }
  } catch (cause) {
    throw new Error('Unable to fetch GitHub members', { cause })
  }
  return new Response(null, { status: 204 })
}
