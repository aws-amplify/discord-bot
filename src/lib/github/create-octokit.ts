import { Octokit } from '@octokit/rest'
import { fetchGitHubToken } from './fetch-github-token'

/**
 * Creates an Octokit instance
 */
export async function createOctokit() {
  const token = (await fetchGitHubToken()).catch(console.error)
  return new Octokit({
    auth: `token ${token}`,
  })
}
