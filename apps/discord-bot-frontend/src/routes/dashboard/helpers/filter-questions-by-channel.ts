import type { Question } from '../types'

/**
 * Filters questions by channel
 */
export function filterQuestionsByChannel(
  questions: Question[],
  channels: string[]
) {
  return questions.filter((question) => channels.includes(question.channelName))
}
