import type { Question } from '../types'

/**
 * Get percentage of questions solved
 * @param questions Questions to filter
 * @returns {number} percentage of questions solved
 */
export function getPercentageOfQuestionsSolved(questions: Question[]) {
  const solved = questions.filter((question) => question.isSolved)
  return Math.round((solved.length / questions.length) * 100)
}
