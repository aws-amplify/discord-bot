/**
 * @TODO replace with GitHub API call
 */
async function fetchRepositories() {
  const github = 'https://github.com'
  const org = 'aws-amplify'
  const createRepoUrl = (repo: string) => `${github}/${org}/${repo}`
  return {
    android: createRepoUrl('amplify-android'),
    bot: createRepoUrl('discord-bot'),
    cli: createRepoUrl('amplify-cli'),
    docs: createRepoUrl('docs'),
    flutter: createRepoUrl('amplify-flutter'),
    hosting: createRepoUrl('amplify-hosting'),
    ios: createRepoUrl('amplify-ios'),
    js: createRepoUrl('amplify-js'),
    ui: createRepoUrl('amplify-ui'),
  }
}

export const repositories = new Map<string, string>(
  Object.entries(await fetchRepositories())
)
