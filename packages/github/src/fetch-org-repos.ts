import { Octokit } from '@octokit/rest'

/**
 * returns a list of the given organization's repositories,
 * false if error
 *  also this will only work if repos are public
 */
export async function fetchOrgRepos(accessToken: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/repos', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return data
  } catch (err: any) {
    console.error(
      `Failed to fetch repos for ${process.env.GITHUB_ORG_LOGIN}: ${err.response.data.message}`
    )
    return false
  }
}
