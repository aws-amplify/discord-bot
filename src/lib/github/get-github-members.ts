import { createOctokit } from './create-octokit'

export async function getGitHubMembers() {
  const octokit = await createOctokit()
  try {
    const { data } = await octokit.request('GET /orgs/{org}/members', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return data
  } catch (cause) {
    throw new Error(`Unable to fetch GitHub members`, { cause })
  }
  return []
}
