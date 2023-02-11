import { Octokit } from '@octokit/rest'

/**
 * returns true if the user is a member of that org
 * false otherwise or if error
 * (uses access token to determine current user)
 */
export async function isOrgMember(accessToken: string, ghUserId: string) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/members', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    const isOrgMember = data.some(
      (contributor) => contributor.id === Number(ghUserId)
    )
    //if (isOrgMember) return true
    return isOrgMember
  } catch (err: any) {
    console.error(
      `Failed to find org member in ${process.env.GITHUB_ORG_LOGIN}: ${err.response.data.message}`
    )
  }
  return false
}
