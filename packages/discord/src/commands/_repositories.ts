import { getRepos } from '@hey-amplify/github'

const nameToAlias = new Map<string, string>([
  ['amplify-cli', 'cli'],
  ['amplify-ios', 'ios'],
  ['discord-bot', 'discord-bot'],
  ['amplify-ui', 'ui'],
  ['amplify-js', 'js'],
  ['docs', 'docs'],
  ['amplify-android', 'android'],
  ['amplify-flutter', 'flutter'],
  ['amplify-category-api', 'category-api'],
  ['amplify-cli-export-construct', 'cli-export-construct'],
  ['amplify-codegen', 'codegen'],
  ['amplify-adminui', 'adminui'],
  ['amplify-hosting', 'hosting'],
])

const alias = (name: string) => nameToAlias.get(name) ?? name

async function fetchRepositories() {
  try {
    const organization = await getRepos()
    if (organization?.repositories?.edges?.length) {
      const repos = organization.repositories.edges
      return repos
        .filter((repo) => nameToAlias.get(repo.node.name))
        .reduce((accumulator, repo) => {
          return { ...accumulator, [alias(repo.node.name)]: repo.node.url }
        }, {})
    }
  } catch (cause) {
    console.error(`Error fetching repositories`, { cause })
  }
  return {}
}

const containsQA = (category: Category) =>
  category?.name === process.env.GITHUB_DISCUSSION_CATEGORY
const getQAIdx = (categories: Category[]) =>
  categories.findIndex(
    (category) => category.name === process.env.GITHUB_DISCUSSION_CATEGORY
  )
const getDiscussion = ({ nodes }: { nodes: Category[] }) =>
  nodes[getQAIdx(nodes)]

/** Return repositories that have the Q&A category on Discussions enabled */
async function fetchRepositoriesWithDiscussions() {
  try {
    const organization = await getRepos()
    if (organization?.repositories?.edges?.length) {
      const repos = organization.repositories.edges
      const res = repos
        .map((repo) => repo.node)
        .filter(
          (repo) =>
            repo.discussionCategories.nodes.some(containsQA) &&
            nameToAlias.get(repo.name)
        )
        .map(({ discussionCategories, ...rest }) => ({
          discussion: getDiscussion(discussionCategories),
          ...rest,
        }))
        .reduce(
          (obj, repo: Repository) => ({ ...obj, [alias(repo.name)]: repo }),
          {}
        )
      return res
    }
  } catch (cause) {
    console.error(`Error fetching repositories with discussions`, { cause })
  }
  return {}
}

export const repositories = new Map<string, string>(
  Object.entries(await fetchRepositories())
)

export const repositoriesWithDiscussions = new Map<string, Repository>(
  Object.entries(await fetchRepositoriesWithDiscussions())
)

type Repository = {
  name: string
  url: string
  id: string
  discussion: Category
}

type Category = {
  id: string
  name: string
}
