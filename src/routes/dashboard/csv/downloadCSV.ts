import type { Questions } from '../types'

export function toCSV(channels: string[], questions: Map<string, Questions>) {
  let csv =
    'Channel,Number of Questions, Answered by Staff, Answered by Community, Unanswered,'

  const sortedQs: Map<string, Map<string, Questions>> = reshape(
    channels,
    questions
  )

  const [first] = sortedQs.values()
  if(!first) return /** @todo throw some error */
  const columns = first.keys()
  csv += Array.from(columns).join(',')
  csv += '\n'

  sortedQs.forEach((datesMap, channel) => {
    csv += `${channel},`
    datesMap.forEach((questionsObj, key) => {
        const total = questionsObj.total?.length ?? 0
        const staff = questionsObj.staff?.length ?? 0
        const community = questionsObj.community?.length ?? 0
        const unanswered = questionsObj.unanswered?.length ?? 0

        if(key === 'aggregate') {
            csv += `${total},`
            csv += `${staff},`
            csv += `${community},`
            csv += `${unanswered},`
        }
        csv += total > 0 ? `${ Math.round(100* (staff + community) / total)}%,` : '0%,'
    })
    csv += '\n'
  })

  const hiddenElement = document.createElement('a')
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
  hiddenElement.target = '_blank'

  hiddenElement.download = 'Questions.csv'
  hiddenElement.click()
  return
}

/** filters a questions object so it only contains questions with the relevant channel */
function filterQuestionsByChannel(channel: string, questions: Questions) {
  const filtered = Object.assign({}, questions)
  Object.entries(questions).forEach(([category, categoryQuestions]) => {
    filtered[category as keyof Questions] = categoryQuestions.filter(
      (question) => {
        return question.channelName === channel
      }
    )
  })
  return filtered
}

/** filters date => categorized questions map so it only contains questions
 * with the relevant channel
 */
function filterQuestionsMapByChannel(
  channel: string,
  questionsMap: Map<string, Questions>
) {
  const filtered = new Map<string, Questions>()
  questionsMap.forEach((questionsObj, date) => {
    filtered.set(date, filterQuestionsByChannel(channel, questionsObj))
  })
  return filtered
}

/** rearranges date => categorized questions map into nested map with channel
 * ie channel => date => categorized questions
 */
function sortByChannel(channels: string[], questions: Map<string, Questions>) {
  const sorted = new Map<string, Map<string, Questions>>()
  for (const channel of channels) {
    sorted.set(channel, filterQuestionsMapByChannel(channel, questions))
  }
  return sorted
}

export function reshape(
  channels: string[],
  questions: Map<string, Questions>
): Map<string, Map<string, Questions>> {
  const sortedByChannel: Map<string, Map<string, Questions>> = sortByChannel(
    channels,
    questions
  )
  return sortedByChannel
}

// function download_csv_file() {
//   //define the heading for each row of the data
//   var csv = 'Name,Profession\n'

//   //merge the data with CSV
//   csvFileData.forEach(function (row) {
//     csv += row.join(',')
//     csv += '\n'
//   })

//   //display the created CSV data on the web browser
//   document.write(csv)

//   var hiddenElement = document.createElement('a')
//   hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
//   hiddenElement.target = '_blank'

//   //provide the name for the CSV file to be downloaded
//   hiddenElement.download = 'Famous Personalities.csv'
//   hiddenElement.click()
// }
