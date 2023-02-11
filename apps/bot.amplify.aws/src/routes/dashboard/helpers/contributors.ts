import type { GitHubUser, Contributor } from '../types'

export function getGitHubUsername(gitHubStaff: GitHubUser[], userId: string) {
  const user = gitHubStaff.find((user) => user.id === Number(userId))
  if (user?.login) return user.login
  return ''
}

export async function getTopContributors(
  contributors: Contributor[],
  gitHubStaff: GitHubUser[],
  n: number
) {
  const filtered = contributors
    .sort((prev, next) => next.answers.length - prev.answers.length)
    .slice(0, n)
  const result = []
  for (const contributor of filtered) {
    let ghUsername = ''
    let name = ''
    if (contributor.githubId) {
      ghUsername = getGitHubUsername(gitHubStaff, contributor.githubId)
    }
    if (ghUsername) {
      name = await (
        await fetch(`${import.meta.env.VITE_HOST}/api/github/${ghUsername}`)
      ).text()
    }
    result.push({
      id: contributor.id,
      discord: await (
        await fetch(
          `${import.meta.env.VITE_HOST}/api/discord/${contributor.id}`
        )
      ).text(),
      github: ghUsername,
      name: name,
      answers: contributor.answers.length,
    })
  }
  return result
}
