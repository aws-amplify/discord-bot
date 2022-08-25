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
  { pct: 0, color: { r: 0xff, g: 0x00, b: 0 } },
  { pct: 50, color: { r: 0xff, g: 0xff, b: 0 } },
  { pct: 100, color: { r: 0x00, g: 0xff, b: 0 } },
]

const getColor = (pct: number) => {
  for (var i = 1; i < percentColors.length - 1; i++) {
    if (pct < percentColors[i].pct) {
      break
    }
  }
  const lower = percentColors[i - 1]
  const upper = percentColors[i]
  const range = upper.pct - lower.pct
  const rangePct = (pct - lower.pct) / range
  const pctLower = 1 - rangePct
  const pctUpper = rangePct
  const color = {
    r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
    g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
    b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper),
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
  // console.log(totalObj)
  // console.log(answeredObj)

  const channelBreakdown = Object.entries(totalObj)
    .map(([channelName, count]) => {
      const pct = answeredObj[channelName]
        ? Math.round(
            (100 * parseInt(answeredObj[channelName])) / parseInt(count)
          )
        : 0
      return {
        channel: channelName,
        color: getColor(pct),
        percent: pct,
        unanswered: answeredObj[channelName]
          ? count - answeredObj[channelName]
          : count,
      }
    })
    .sort((a, b) => a.percent - b.percent)

  //   console.log(channelBreakdown)
  return channelBreakdown
}
