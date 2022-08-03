import { graphql } from '@octokit/graphql'
import { createAppAuth } from '@octokit/auth-app'

const gql = String.raw

const MUTATION_CREATE_DISCUSSION = gql`
  mutation CREATE_DISCUSSION(
    $repositoryId: ID!
    $categoryId: ID!
    $title: String!
    $body: String!
    $clientMutationId: String
  ) {
    createDiscussion(
      input: {
        repositoryId: $repositoryId
        categoryId: $categoryId
        title: $title
        body: $body
        clientMutationId: $clientMutationId
      }
    ) {
      clientMutationId
      discussion {
        id
        url
      }
    }
  }
`

const MUTATION_LOCK_DISCUSSION = gql`
  mutation LOCK_DISCUSSION($discussionId: ID!, $clientMutationId: String) {
    lockLockable(
      input: { lockableId: $discussionId, clientMutationId: $clientMutationId }
    ) {
      lockedRecord {
        locked
      }
    }
  }
`

const MUTATION_ADD_DISCUSSION_COMMENT = gql`
  mutation AddDiscussionComment(
    $discussionId: ID!
    $body: String!
    $clientMutationId: String
    $replyToId: ID
  ) {
    addDiscussionComment(
      input: {
        discussionId: $discussionId
        body: $body
        clientMutationId: $clientMutationId
        replyToId: $replyToId
      }
    ) {
      clientMutationId
      comment {
        id
      }
    }
  }
`

const MUTATION_RESOLVE_DISCUSSION = gql`
  mutation ResolveDiscussion($commentId: ID!, $clientMutationId: String) {
    markDiscussionCommentAsAnswer(
      input: { id: $commentId, clientMutationId: $clientMutationId }
    ) {
      __typename
    }
  }
`

const MUTATION_DELETE_DISCUSSION = gql`
  mutation DeleteDiscussion($discussionId: ID!, $clientMutationId: String) {
    deleteDiscussion(
      input: { id: $discussionId, clientMutationId: $clientMutationId }
    ) {
      __typename
    }
  }
`

const QUERY_GET_REPOSITORIES = gql`
  query GetRepositories($login: String!) {
    organization(login: $login) {
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        edges {
          node {
            name
            url
			id
            discussionCategories(first: 20) {
              nodes {
                id
                name
              }
            }
          }
          cursor
        }
      }
    }
  }
`

async function authenticate() {
  const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    installationId: process.env.GITHUB_INSTALLATION_ID,
  })

  const request = graphql.defaults({
    request: {
      hook: auth.hook,
    },
  })

  return request
}

export async function getRepos() {
  try {
    const request = await authenticate()
    const { organization } = await request(QUERY_GET_REPOSITORIES, { login: process.env.GITHUB_ORG_LOGIN })
	if(organization) return organization
  } catch (err) {
    console.error(err)
  }
  return false
}

// TODO: is it safe to assume 
export async function postDiscussion(repoId: string) {
	try {
		const request = await authenticate()
		//const response = await request(MUTATION_CREATE_DISCUSSION, {})
	} catch (err) {
		console.error(err)
	}
}
