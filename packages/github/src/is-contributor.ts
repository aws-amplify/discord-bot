import { Octokit } from '@octokit/rest'

/**
 *  for each repository belonging to the org, retrieves a list of
 * contributors. returns true if the user with a given id is
 * a contributor in at least one repository,
 * false otherwise or if error
 */
export async function isContributor(
  accessToken: string,
  /**
   * @todo strongly type
   */
  repos: any[],
  userId: string
) {
  const octokit = new Octokit({
    auth: `token ${accessToken}`,
  })

  for (let i = 0; i < repos.length; i++) {
    const amplifyRepo = repos[i]?.name

    try {
      const { data } = await octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner: process.env.GITHUB_ORG_LOGIN,
          repo: amplifyRepo,
        }
      )

      const isContributor = data.some(
        (contributor) => contributor.id === Number(userId)
      )
      if (isContributor) return true
    } catch (err: any) {
      console.error(
        `Error searching for user in repository ${amplifyRepo}: ${err.response.data.message}`
      )
    }
  }
  return false
}
