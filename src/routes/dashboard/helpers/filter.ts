import { filterQuestionsByChannel } from './filter-questions-by-channel'
import { filterQuestionsByDateRange } from './filter-questions-by-date-range'
import { filterQuestionsByTag } from './filter-questions-by-tag'
import { type Contributor, type Question, type Questions } from '../types'

/** counts the number of questions between two dates in each category */
function filterQuestionsByDate(
  datedQuestions: Map<string, Questions>,
  questions: Questions,
  dates: Date[]
): Questions {
  const filteredQs = {
    total: [],
    unanswered: [],
    staff: [],
    community: [],
  } as Questions

  for (const [category, categoryQuestions] of Object.entries(questions)) {
    const questionsBetweenDates = filterQuestionsByDateRange(
      categoryQuestions,
      dates
    )
    const key = category as keyof Questions
    filteredQs[key] = questionsBetweenDates
    datedQuestions.get('aggregate')![key] = datedQuestions
      .get('aggregate')!
      [key].concat(questionsBetweenDates)
  }
  return filteredQs
}

/**
 * bins dates by mapping a start date to the number of questions in each category, beginning at the
 * start date and ending at the next sequential date, or today for the last date
 * also keeps track of total number of questions for the overall time period
 */
function binDates(dates: Date[], questions: Questions): Map<string, Questions> {
  const today = new Date()
  const datedQuestions = new Map<string, Questions>([
    ['aggregate', { total: [], unanswered: [], staff: [], community: [] }],
  ])
  if (!dates?.length) return datedQuestions

  for (let i = 0; i < dates?.length - 1; i++) {
    datedQuestions.set(
      dates[i].toString(),
      filterQuestionsByDate(datedQuestions, questions, [dates[i], dates[i + 1]])
    )
  }
  datedQuestions.set(
    dates[dates.length - 1].toString(),
    filterQuestionsByDate(datedQuestions, questions, [
      dates[dates.length - 1],
      today,
    ])
  )
  return datedQuestions
}

/** filters categorized questions by channel and date */
export function filterQuestionsByChannelAndDate(
  questions: Questions,
  channels: string[],
  tags: string[],
  dates: Date[]
): Map<string, Questions> {
  const filtered = Object.assign({}, questions)
  for (const [category, categoryQuestions] of Object.entries(questions)) {
    const filteredByChannel = filterQuestionsByChannel(
      categoryQuestions,
      channels
    )
    const filteredByTag = filterQuestionsByTag(filteredByChannel, tags)
    const key = category as keyof Questions
    filtered[key] = filteredByTag
  }
  return binDates(dates, filtered)
}

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
