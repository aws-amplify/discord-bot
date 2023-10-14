import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import type { Contributor } from '../types'

export async function getAllContributors(
  guildId: string
): Promise<Contributor[]> {
  try {
    const data = await prisma.discordUser.findMany({
      where: {
        answers: {
          every: {
            question: {
              guildId,
            },
          },
          some: {
            participation: {
              participantRoles: {
                some: {
                  role: {
                    accessLevelId: {
                      in: [
                        ACCESS_LEVELS.STAFF,
                        ACCESS_LEVELS.ADMIN,
                        ACCESS_LEVELS.MEMBER,
                        ACCESS_LEVELS.CONTRIBUTOR,
                      ],
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
        account: {
          select: {
            user: {
              select: {
                accounts: {
                  where: {
                    provider: 'github',
                  },
                  select: {
                    providerAccountId: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          where: {
            participation: {
              participantRoles: {
                some: {
                  role: {
                    accessLevelId: {
                      in: [
                        ACCESS_LEVELS.STAFF,
                        ACCESS_LEVELS.ADMIN,
                        ACCESS_LEVELS.MEMBER,
                        ACCESS_LEVELS.CONTRIBUTOR,
                      ],
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
        user['githubId'] =
          user.account?.user?.accounts[0]?.providerAccountId ?? null
        delete user.account
        user.answers = user.answers.map((answer) => {
          answer['channelName'] = answer.question?.channelName ?? ''
          delete answer.question
          answer.createdAt = answer.createdAt.toString()
          return answer
        })
        return user
      })
    )
  } catch (error) {
    console.error(`Failed to fetch all contributors: ${error.message}`)
  }
  return []
}
