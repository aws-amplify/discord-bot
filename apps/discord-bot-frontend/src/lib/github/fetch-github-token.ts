import { createAppAuth } from '@octokit/auth-app'

/**
 * Fetches a GitHub App Installation Token
 * @returns {string} GitHub App Installation Token
 */
export async function fetchGitHubToken() {
  const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  })
  let token
  try {
    const response = await auth({
      type: 'installation',
      installationId: process.env.GITHUB_INSTALLATION_ID,
    })
    token = response?.token
  } catch (cause) {
    throw new Error('Error fetching GitHub installation token', { cause })
  }
  return token
}
