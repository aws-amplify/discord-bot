import { filterQuestionsByChannel } from './filter-questions-by-channel'
import { filterQuestionsByDateRange } from './filter-questions-by-date-range'
import type { Contributor } from '../types'

/**
 * Filter answers by channel and date range
 * @TODO refactor this to be more generic
 */
export function filterAnswers(
  channels: string[],
  dates: Date[],
  contributors: Contributor[]
): Contributor[] {
  return contributors.map((user) => {
    const newUser = Object.assign({}, user)
    const filtered = filterQuestionsByChannel(user.answers, channels)
    newUser.answers = filterQuestionsByDateRange(filtered, dates)
    return user
  })
}
