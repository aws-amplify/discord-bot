import type {
  Answer as PrismaAnswer,
  Question as PrismaQuestion,
  AccessLevelRole,
  QuestionTag,
} from '@prisma/client'
import type { TIME_PERIODS, HEALTH_STATUS } from './constants'

export type TimePeriod = ValueOf<typeof TIME_PERIODS>
export type HealthStatus = ValueOf<typeof HEALTH_STATUS>

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
  'channelName' | 'id' | 'isSolved' | 'title'
> & {
  // we're overriding the createdAt type from a string to Date
  createdAt: Date
  tags: QuestionTag[]
  answer: Pick<PrismaAnswer, 'id'> & {
    participation: {
      participantRoles: {
        role: AccessLevelRole
      }[]
    }
  }
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

/**
 * Question breakdown item
 */
export type QuestionBreakdownItem = {
  /**
   * The title of the card
   */
  title: string
  /**
   * The count of the questions
   */
  count: number
  /**
   * The color of the card
   */
  color?: string
  /**
   * The color of the card's percentage tag (if any)
   */
  percentageColor?: string
  /**
   * The percentage of the questions
   */
  percentage?: number
}
