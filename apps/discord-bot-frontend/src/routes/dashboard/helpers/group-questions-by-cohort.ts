import type { Question } from '../types'
import { COHORTS } from '../constants'
import { ACCESS_LEVELS } from '$lib/constants'

/**
 * Group questions by cohort. This will group questions by their answer's cohort.
 */
export function groupQuestionsByCohort(questions: Question[]) {
  const grouped = questions.reduce<Record<string, Question[]>>(
    (acc, question) => {
      let key: ValueOf<typeof COHORTS>
      if (question.isSolved) {
        if (question.answer) {
          // here we only really need whether the member is 'staff' or not
          const isStaff = question.answer.participation.participantRoles.some(
            ({ role }) => role?.accessLevelId === ACCESS_LEVELS.STAFF
          )
          if (isStaff) {
            // bucket staff to 'staff'
            key = COHORTS.STAFF
          } else {
            // bucket everyone else to 'community'
            key = COHORTS.COMMUNITY
          }
        } else {
          // if the question is solved but there is no answer, bucket it to 'solved without answer'
          key = COHORTS.SOLVED_WITHOUT_ANSWER
        }
      } else {
        // if the question is not solved, bucket it to 'unanswered'
        key = COHORTS.UNANSWERED
      }
      if (acc[key]) {
        acc[key].push(question)
      } else {
        acc[key] = [question]
      }
      return acc
    },
    {}
  )

  return grouped
}
