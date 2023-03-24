import { ACCESS_LEVELS } from '$lib/constants'
import type { Question } from '../types'

/**
 * Group questions by cohort. This will group questions by their answer's cohort.
 */
export function groupQuestionsByCohort(questions: Question[]) {
  const grouped = questions.reduce<Record<string, Question[]>>(
    (acc, question) => {
      if (question.answer) {
        // here we only really need whether the member is 'staff' or not
        const isStaff = question.answer.participation.participantRoles.some(
          ({ role }) => role?.accessLevelId === ACCESS_LEVELS.STAFF
        )
        if (isStaff) {
          if (acc[ACCESS_LEVELS.STAFF]) {
            acc[ACCESS_LEVELS.STAFF].push(question)
          } else {
            acc[ACCESS_LEVELS.STAFF] = [question]
          }
        } else {
          acc[ACCESS_LEVELS.MEMBER] = [question]
        }
      } else {
        const key = 'UNANSWERED'
        if (acc[key]) {
          acc[key].push(question)
        } else {
          acc[key] = [question]
        }
      }
      return acc
    },
    {}
  )

  return grouped
}
