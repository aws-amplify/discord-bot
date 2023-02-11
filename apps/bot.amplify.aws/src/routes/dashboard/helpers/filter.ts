import type { Contributor, Question, Questions } from '../types'

function filterByDate(questions: Question[], dates: Date[]): Question[] {
  return questions.filter(
    (question) =>
      new Date(question.createdAt) >= dates[0] &&
      new Date(question.createdAt) < dates[1]
  )
}

function filterByChannel(channels: string[], questions: Question[]) {
  return questions.filter((question) => channels.includes(question.channelName))
}

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
    const questionsBetweenDates = filterByDate(categoryQuestions, dates)
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
  channels: string[],
  dates: Date[],
  questions: Questions
): Map<string, Questions> {
  const filtered = Object.assign({}, questions)
  for (const [category, categoryQuestions] of Object.entries(questions)) {
    filtered[category as keyof Questions] = filterByChannel(
      channels,
      categoryQuestions
    )
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
    const filtered = filterByChannel(channels, user.answers)
    newUser.answers = filterByDate(filtered, dates)
    return user
  })
}
