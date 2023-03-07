import type { Question as PrismaQuestion, QuestionTag } from '@prisma/client'

export type Questions = {
  total: Question[]
  unanswered: Question[]
  staff: Question[]
  community: Question[]
}

export type Contributors = {
  all: Contributor[]
  staff: Contributor[]
  // community: Contributor[],
}

export type Question = Pick<
  PrismaQuestion,
  'channelName' | 'createdAt' | 'id' | 'isSolved'
> & {
  tags: QuestionTag[]
}

export type Contributor = {
  id: string
  githubId?: string
  discordUsername?: string
  answers: Question[]
}

/**
 * @todo can this come from a GitHub package?
 * @see https://www.npmjs.com/package/@octokit/types
 */
export type GitHubUser = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}
