import type { GroupByDateOptions } from './group-questions-by-date'
import type { Question } from '../types'
import { groupQuestionsByChannel } from './group-questions-by-channel'
import { groupQuestionsByCohort } from './group-questions-by-cohort'
import { groupQuestionsByDate } from './group-questions-by-date'
import { groupQuestionsByTag } from './group-questions-by-tag'

type GroupOptions = {
  by: 'channel' | 'cohort' | 'date' | 'tag'
  /**
   * if 'date' is selected, this is required
   */
  byDateOptions?: GroupByDateOptions
}

export function groupQuestions(questions: Question[], options: GroupOptions) {
  let grouped: Record<string, Question[]> = {}

  switch (options.by) {
    case 'channel': {
      grouped = groupQuestionsByChannel(questions)
      break
    }
    case 'cohort': {
      grouped = groupQuestionsByCohort(questions)
      break
    }
    case 'date': {
      if (!options.byDateOptions) {
        throw new Error('byDateOptions is required if "by" is "date"')
      }
      grouped = groupQuestionsByDate(questions, options.byDateOptions)
      break
    }
    case 'tag': {
      grouped = groupQuestionsByTag(questions)
      break
    }
    default:
      throw new Error('Invalid group by option')
  }

  return grouped
}
