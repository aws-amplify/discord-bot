import type { Question } from '../types'

/**
 * Filters questions by date
 * @param questions Questions to filter
 * @param dates Dates to filter by
 */
export function filterQuestionsByDateRange(
  questions: Question[],
  dates: Date[]
) {
  return questions.filter(
    (question) =>
      new Date(question.createdAt) >= dates[0] &&
      new Date(question.createdAt) < dates[1]
  )
}
