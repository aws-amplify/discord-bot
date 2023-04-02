import { error } from '@sveltejs/kit'
import { Routes } from 'discord-api-types/v10'
import { api } from '$discord/api'
import { prisma } from '$lib/db'
import { getGitHubMembers } from '$lib/github/get-github-members'
import { getStaffContributors } from './helpers/get-staff-contributors'
import { getAllContributors } from './helpers/get-all-contributors'
import { fetchHelpChannels } from './helpers/fetch-help-channels'
import type { APIGuildPreview } from 'discord-api-types/v10'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  console.debug('[dashboard] server load')
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
    // @ts-expect-error mutating return object to have correct return type
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
    availableTags: Array.from(
      new Set(questions.map(({ tags }) => tags.map(({ name }) => name)).flat())
    ).sort((a, b) => a.localeCompare(b)),
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
  }
}
