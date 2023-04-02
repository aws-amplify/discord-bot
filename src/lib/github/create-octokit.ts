import { Octokit } from '@octokit/rest'
import { fetchGitHubToken } from './fetch-github-token'

/**
 * Creates an Octokit instance
 */
export async function createOctokit() {
  const token = await fetchGitHubToken()
  return new Octokit({
    auth: `token ${token}`,
  })
}
