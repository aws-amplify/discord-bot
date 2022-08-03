import { getRepos } from '../../github/queries'
/**
 * @TODO replace with GitHub API call
 */


const ghNameToAlias = {
  'amplify-cli': 'cli',
  'amplify-ios': 'ios',
  'discord-bot': 'discord-bot',
  'amplify-ui': 'ui',
  'community': 'community',
  'amplify-js': 'js',
  'docs': 'docs',
  'amplify-android': 'android',
  'amplify-flutter': 'flutter',
  'amplify-codegen-ui': 'codegen-ui',
  'amplify-category-api': 'category-api',
  'amplify-cli-export-construct': 'cli-export-construct',
  'amplify-codegen': 'codegen',
  'amplify-adminui': 'adminui',
  'aws-sdk-ios': 'sdk-ios',
  'aws-sdk-android': 'sdk-android',
  'aws-appsync-realtime-client-ios': 'appsync-realtime-client-ios',
  'amplify-js-samples': 'js-samples',
  'maplibre-gl-js-amplify': 'maplibre-gl-js',
  'aws-amplify.github.io':  'aws-amplify.github.io',
  'aws-sdk-ios-spm': 'ios-spm',
  'amplify-ci-support': 'ci-support',
  'maplibre-gl-draw-circle':   'maplibre-gl-draw-circle',
  'amplify-ios-samples': 'ios-samples',
  'amplify-hosting': 'hosting',
  'amplify-ios-maplibre': 'ios-maplibre',
  'amplify-android-samples': 'android-samples',
  '.github': '.github'
}
// async function fetchRepositories() {
//   const github = 'https://github.com'
//   const org = 'aws-amplify'
//   const createRepoUrl = (repo: string) => `${github}/${org}/${repo}`
//   return {
//     android: createRepoUrl('amplify-android'),
//     bot: createRepoUrl('discord-bot'),
//     cli: createRepoUrl('amplify-cli'),
//     docs: createRepoUrl('docs'),
//     flutter: createRepoUrl('amplify-flutter'),
//     hosting: createRepoUrl('amplify-hosting'),
//     ios: createRepoUrl('amplify-ios'),
//     js: createRepoUrl('amplify-js'),
//     ui: createRepoUrl('amplify-ui'),
//   }
// }

export async function fetchRepositories() {
  const organization = await getRepos()
  const repos = organization.repositories.edges
  console.log(repos)
  if (repos?.length) console.log(repos?.reduce((obj, repo) => ({ ...obj, [repo.node.name]: repo.node}), {}) )
}

// if(organization?.repositories?.edges?.length) {
//   console.log(organization.repositories.edges.filter)
//   const containsQA = (category) => category.name === process.env.GITHUB_DISCUSSION_CATEGORY
//   return organization.repositories.edges.filter((repo) => repo.node.discussionCategories.nodes.some(containsQA))
// }

// async function fetchRepositoriesWithDiscussions() {
//   const repos = await getReposWithDiscussions()
//   if (repos?.length) return repos?.reduce((obj, repo) => ({ ...obj, [repo.node.name]: repo.node}), {})   
//   return false 
// }

export const repositories = new Map<string, string>(
  Object.entries(await fetchRepositories())
)
