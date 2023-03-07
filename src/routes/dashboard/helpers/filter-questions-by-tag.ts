import type { Question } from '../types'

/**
 * Filter Questions by Forum Channel tags
 * @param questions Questions to filter
 * @param tags tags to filter by
 */
export function filterQuestionsByTag(questions: Question[], tags: string[]) {
  return questions.filter((question) =>
    tags.some((tag) => question.tags.some((t) => t.name === tag))
  )
}
