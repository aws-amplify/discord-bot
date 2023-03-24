import type { Question } from '../types'

/**
 * Group questions by channel
 */
export function groupQuestionsByChannel(questions: Question[]) {
  const grouped = questions.reduce((acc, question) => {
    if (acc[question.channelName]) {
      acc[question.channelName].push(question)
    } else {
      acc[question.channelName] = [question]
    }
    return acc
  }, {} as Record<string, Question[]>)

  return grouped
}
