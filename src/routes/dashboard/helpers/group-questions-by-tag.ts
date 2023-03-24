import type { Question } from '../types'

/**
 * Group questions by tag
 */
export function groupQuestionsByTag(questions: Question[]) {
  const grouped = questions.reduce((acc, question) => {
    if (question.tags) {
      for (const tag of question.tags) {
        if (acc[tag.name]) {
          acc[tag.name].push(question)
        } else {
          acc[tag.name] = [question]
        }
      }
    }
    return acc
  }, {} as Record<string, Question[]>)

  return grouped
}
