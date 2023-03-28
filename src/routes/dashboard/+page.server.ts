import { error } from '@sveltejs/kit'
import { Routes } from 'discord-api-types/v10'
import { api } from '$discord/api'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { getGitHubMembers } from './helpers/github'
import { getStaffContributors } from './helpers/get-staff-contributors'
import { getAllContributors } from './helpers/get-all-contributors'
import { fetchHelpChannels } from './helpers/fetch-help-channels'
import type { APIGuildPreview } from 'discord-api-types/v10'
import type { PageServerLoad } from './$types'
import type { Question } from './types'

async function getStaffAnswers(guildId: string): Promise<Question[]> {
  try {
    const data = await prisma.answer.findMany({
      where: {
        question: {
          guildId,
        },
        participation: {
          participantRoles: {
            some: {
              role: {
                accessLevelId: {
                  in: [ACCESS_LEVELS.STAFF],
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        question: {
          select: {
            channelName: true,
          },
        },
      },
    })
    /** @ts-expect-error mutating return object to have correct return type */
    return data.map((answer) => {
      answer['channelName'] = answer.question?.channelName ?? ''
      delete answer.question
      answer.createdAt = answer.createdAt.toString()
      return answer
    })
  } catch (error) {
    console.error(`Failed to fetch staff answers ${error.message}`)
  }
  return []
}

async function getCommunityAnswers(guildId: string): Promise<Question[]> {
  try {
    const data = await prisma.answer.findMany({
      where: {
        question: {
          guildId,
        },
        participation: {
          participantRoles: {
            none: {
              role: {
                accessLevelId: {
                  in: [ACCESS_LEVELS.STAFF],
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        question: {
          select: {
            channelName: true,
          },
        },
      },
    })
    /** @ts-expect-error mutating return object to have correct return type */
    return data.map((answer) => {
      answer['channelName'] = answer.question?.channelName ?? ''
      delete answer.question
      answer.createdAt = answer.createdAt.toString()
      return answer
    })
  } catch (error) {
    console.error(`Failed to fetch staff answers ${error.message}`)
  }
  return []
}

export const load: PageServerLoad = async ({ locals }) => {
  const guildId = locals.session.guild
  const questions = (
    await prisma.question.findMany({
      where: {
        guildId,
      },
      select: {
        id: true,
        createdAt: true,
        channelName: true,
        isSolved: true,
        tags: {
          select: {
            name: true,
          },
        },
        title: true,
        url: true,
        answer: {
          select: {
            id: true,
            participation: {
              select: {
                participantRoles: {
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  ).map((question) => {
    question.createdAt = question.createdAt.toString()
    return question
  })

  if (!questions.length) {
    throw error(400, 'No questions found for this guild.')
  }

  const guildPreview = (await api.get(
    Routes.guildPreview(guildId)
  )) as APIGuildPreview

  return {
    allQuestions: questions,
    allHelpChannels: await fetchHelpChannels(guildId),
    // availableHelpChannels: questions.map(({ channelName }) => channelName),
    /**
     * @deprecated
     */
    tags: Array.from(
      new Set(questions.map(({ tags }) => tags.map(({ name }) => name)).flat())
    ).sort((a, b) => a.localeCompare(b)),
    availableTags: Array.from(
      new Set(questions.map(({ tags }) => tags.map(({ name }) => name)).flat())
    ).sort((a, b) => a.localeCompare(b)),
    /**
     * @deprecated
     */
    contributors: {
      all: await getAllContributors(guildId),
      staff: await getStaffContributors(guildId),
      // community: await getCommunityContributors(),
    },
    gitHubStaff: await getGitHubMembers(),
    guild: {
      totalMemberCount: guildPreview?.approximate_member_count,
      onlineMemberCount: guildPreview?.approximate_presence_count,
    },
    /**
     * @deprecated
     */
    questions: {
      total: questions,
      unanswered: questions.filter((question) => !question.isSolved),
      staff: await getStaffAnswers(guildId),
      community: await getCommunityAnswers(guildId),
    },
  }
}
