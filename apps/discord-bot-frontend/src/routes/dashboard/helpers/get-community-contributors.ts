import type { Contributor } from '../types'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'

/**
 * Currently not displaying community contributors but leaving this here in case it's wanted in the future
 */
export async function getCommunityContributors(): Promise<Contributor[]> {
  try {
    const data = await prisma.discordUser.findMany({
      where: {
        answers: {
          some: {
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
        },
      },
      select: {
        id: true,
        answers: {
          where: {
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
        },
      },
    })
    /** @ts-expect-error mutating return object to have correct return type */
    return Promise.all(
      data.map(async (user) => {
        user.answers = user.answers.map((answer) => {
          answer['channelName'] = answer.question?.channelName ?? ''
          delete answer.question
          return answer
        })
        return user
      })
    )
  } catch (error) {
    console.error(`Failed to fetch community contributors: ${error.message}`)
  }
  return []
}
