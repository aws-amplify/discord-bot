import { filterQuestionsByDateRange } from './filter-questions-by-date-range'
import { filterQuestionsByChannel } from './filter-questions-by-channel'
import { filterQuestionsByTag } from './filter-questions-by-tag'
import type { Question } from '../types'

type DateRange = [Date, Date]
type FilterOptions = {
  /**
   * Date range to filter by, requires a start date and an end date
   */
  dates?: DateRange
  /**
   * Channels to filter by
   */
  channels?: string[]
  /**
   * Post tags to filter by
   */
  tags?: string[]
  /**
   * @default undefined
   */
  isSolved?: boolean
}

export function filterQuestions(questions: Question[], options: FilterOptions) {
  let filtered = questions

  if (options.dates) {
    filtered = filterQuestionsByDateRange(filtered, options.dates)
  }
  if (options.channels) {
    filtered = filterQuestionsByChannel(filtered, options.channels)
  }
  if (options.tags) {
    filtered = filterQuestionsByTag(filtered, options.tags)
  }
  if (options.isSolved !== undefined) {
    filtered = filtered.filter(
      (question) => question.isSolved === options.isSolved
    )
  }

  return filtered
}
