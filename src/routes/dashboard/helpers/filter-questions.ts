import { filterQuestionsByDateRange } from './filter-questions-by-date-range'
import { filterQuestionsByChannel } from './filter-questions-by-channel'
import { filterQuestionsByTag } from './filter-questions-by-tag'
import type { Question } from '../types'

type FilterOptions = {
  dates?: Date[]
  channels?: string[]
  tags?: string[]
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

  return filtered
}
