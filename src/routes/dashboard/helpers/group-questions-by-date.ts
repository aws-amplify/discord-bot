import { getMonday } from './get-monday'
import type { TimePeriod, Question } from '../types'

export type GroupByDateOptions = {
  /**
   * @default 'week'
   */
  period?: TimePeriod
}

/**
 * Group questions by date, by day, week, month, or year
 * @todo prefill empty groups for weeks without questions
 */
export function groupQuestionsByDate(
  questions: Question[],
  options?: GroupByDateOptions
) {
  const grouped = questions.reduce<Record<string, Question[]>>(
    (acc, question) => {
      const date = new Date(question.createdAt)
      let key: string
      switch (options?.period ?? 'week') {
        case 'day': {
          const day = date.toDateString()
          key = day
          break
        }
        case 'week': {
          const monday = getMonday(date)
          const weekOf = monday.toDateString()
          key = weekOf
          break
        }
        case 'month': {
          date.setDate(1)
          const month = date.toDateString()
          key = month
          break
        }
        case 'year': {
          const year = date.getFullYear()
          key = year.toString()
          break
        }
        default:
          throw new Error('Invalid time period')
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
