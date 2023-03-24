import type { Question } from '../types'

/**
 * Group questions by channel
 */
export function groupQuestionsByChannel(questions: Question[]) {
  const grouped = questions.reduce<Record<string, Question[]>>(
    (acc, question) => {
      if (acc[question.channelName]) {
        acc[question.channelName].push(question)
      } else {
        acc[question.channelName] = [question]
      }
      return acc
    },
    {}
  )

  return grouped
}
