import type { Question, Questions } from '../types'

export function sortChannels(questions: Question[]) {
  const counts = questions.reduce((count, question) => {
    const key = question.channelName
    return count[key] ? ++count[key] : (count[key] = 1), count
  }, {})

  return Object.entries(counts)
    .map(([channelName, count]) => ({ group: channelName, count }))
    .sort((a, b) => a.group.localeCompare(b.group))
}

const getColor = (percent: number) => {
  if (percent < 50) {
    return 'rgb(255, 0, 0, 0.4)'
  } else if (50 <= percent && percent < 60) {
    return 'rgb(255, 255, 0, 0.4)'
  }
  return 'rgb(0, 255, 0, 0.4'
}

export function getChannelHealth(questions: Questions) {
  const totalObj = questions.total.reduce((count, question) => {
    const key = question.channelName
    return count[key] ? ++count[key] : (count[key] = 1), count
  }, {})

  const answeredObj = questions.staff
    .concat(questions.community)
    .reduce((count, question) => {
      const key = question.channelName
      return count[key] ? ++count[key] : (count[key] = 1), count
    }, {})

  const channelBreakdown = Object.entries(totalObj)
    .map(([channelName, count]) => {
      const percent = answeredObj[channelName]
        ? Math.round(
            (100 * parseInt(answeredObj[channelName])) / parseInt(count)
          )
        : 0
      return {
        channel: channelName,
        color: getColor(percent),
        percent: percent,
        unanswered: answeredObj[channelName]
          ? count - answeredObj[channelName]
          : count,
      }
    })
    .sort((a, b) => a.percent - b.percent)

  return channelBreakdown
}
