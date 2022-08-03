import { getRepos } from '../../github/queries'

const nameToAlias = {
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
  'aws-amplify.github.io': 'aws-amplify.github.io',
  'aws-sdk-ios-spm': 'ios-spm',
  'amplify-ci-support': 'ci-support',
  'maplibre-gl-draw-circle': 'maplibre-gl-draw-circle',
  'amplify-ios-samples': 'ios-samples',
  'amplify-hosting': 'hosting',
  'amplify-ios-maplibre': 'ios-maplibre',
  'amplify-android-samples': 'android-samples',
  '.github': '.github',
}

const getAlias = (name: string) =>
  nameToAlias[name] ? nameToAlias[name] : name
const containsQA = (category) =>
  category?.name === process.env.GITHUB_DISCUSSION_CATEGORY

async function fetchRepositories() {
  try {
    const organization = await getRepos()
    if (organization?.repositories?.edges?.length) {
      const repos = organization.repositories.edges
      const aliased = repos.reduce(
        (obj, repo) => ({ ...obj, [getAlias(repo.node.name)]: repo.node.url }),
        {}
      )
      // console.log("1")
      // console.log(aliased)
      // console.log("2")
      // console.log(Object.entries(aliased))
      // console.log("3")
      const repositories = new Map<string, Repository>(Object.entries(aliased))
   //   console.log([...repositories.keys()].map((r) => ({ name: r, value: r })))
      return aliased
    }
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`)
  }
  return {}
}

// async function fetchRepositories() {
//   const github = 'https://github.com'
//   const org = 'aws-amplify'
//   const createRepoUrl = (repo: string) => `${github}/${org}/${repo}`
//   const obj = {
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
//   console.log(obj)
//   console.log(Object.entries(obj))
//   console.log(new Map<string, string>(Object.entries(obj)))
//   return obj
// }

/** Return repositories that have the Q&A category on Discussions enabled */
async function fetchRepositoriesWithDiscussions() {
  try {
    const organization = await getRepos()
    if (organization) {
      const repos = organization?.repositories?.edges
      const filtered = repos.filter((repo) =>
        repo?.node?.discussionCategories?.nodes?.some(containsQA)
      )
      //  console.log(filtered)
      const aliased = filtered?.reduce(
        (obj, repo) => ({ ...obj, [getAlias(repo.node.name)]: repo.node }),
        {}
      )
      //  console.log("discussions")
      // console.log(aliased)
      return aliased
    }
  } catch (error) {
    console.error(
      `Error fetching repositories with discussions: ${error.message}`
    )
  }
  return {}
}

export const repositories = new Map<string, string>(
  Object.entries(await fetchRepositories())
)

// export const repositoriesWithDiscussions = new Map<string, Repository>(
//   Object.entries(await fetchRepositoriesWithDiscussions())
// )

type Repository = {
  name: string
  url: string
  id: string
  discussionCategories: DiscussionCategories
}

type DiscussionCategories = {
  nodes: string[]
}
