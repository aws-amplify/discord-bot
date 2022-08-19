export type Questions = {
  total: Question[],
  unanswered: Question[],
  staff: Question[],
  community: Question[],
}

export type Contributors = {
  staff: Contributor[],
  community: Contributor[],
}

export type Question = {
  channelName: string,
  createdAt: Date,
  id: string,
  isSolved?: boolean
}

export type Contributor = {
  id: string,
  githubId?: string,
  discordUsername?: string,
  answers: Question[]
}