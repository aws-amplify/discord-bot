import { groupQuestionsByChannel } from './group-questions-by-channel'
import { groupQuestionsByDate } from './group-questions-by-date'
import { groupQuestionsByTag } from './group-questions-by-tag'
import type { GroupByDateOptions } from './group-questions-by-date'
import type { Question } from '../types'

type GroupOptions = {
  by: 'channel' | 'date' | 'tag'
  /**
   * if 'date' is selected, this is required
   */
  byDateOptions?: GroupByDateOptions
}

export function groupQuestions(questions: Question[], options: GroupOptions) {
  let grouped: Record<string, Question[]> = {}

  if (options.by === 'channel') {
    grouped = groupQuestionsByChannel(questions)
  }

  if (options.by === 'date') {
    if (!options.byDateOptions) {
      throw new Error('byDateOptions is required if "by" is "date"')
    }
    grouped = groupQuestionsByDate(questions, options.byDateOptions)
  }

  if (options.by === 'tag') {
    grouped = groupQuestionsByTag(questions)
  }

  return grouped
}
