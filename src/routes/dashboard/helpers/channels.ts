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

const percentColors = [
  { percent: 0, color: { r: 0xff, g: 0x00, b: 0 } },
  { percent: 50, color: { r: 0xff, g: 0xff, b: 0 } },
  { percent: 100, color: { r: 0x00, g: 0xff, b: 0 } },
]

const getColor = (percent: number) => {
  for (var i = 1; i < percentColors.length - 1; i++) {
    if (percent < percentColors[i].percent) {
      break
    }
  }
  const lower = percentColors[i - 1]
  const upper = percentColors[i]
  const range = upper.percent - lower.percent
  const rangepercent = Math.floor((percent - lower.percent) / range)
  const percentLower = 1 - rangepercent
  const percentUpper = rangepercent
  const color = {
    r: Math.floor(lower.color.r * percentLower + upper.color.r * percentUpper),
    g: Math.floor(lower.color.g * percentLower + upper.color.g * percentUpper),
    b: Math.floor(lower.color.b * percentLower + upper.color.b * percentUpper),
  }
  return 'rgb(' + [color.r, color.g, color.b, 0.4].join(',') + ')'
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
