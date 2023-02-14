import {
  Routes,
  type APIPartialChannel,
  type APIGuildPreview,
} from 'discord-api-types/v10'
import { api, isHelpChannel } from '@hey-amplify/discord'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { getGitHubMembers } from './helpers/github'
import type { ForumChannel, TextChannel } from 'discord.js'
import type {
  Contributor,
  Contributors,
  GitHubUser,
  Question,
  Questions,
} from './types'
import type { PageServerLoad } from './$types'

async function fetchHelpChannels(guildId: string): Promise<string[]> {
  try {
    const allChannels = (await api.get(
      Routes.guildChannels(guildId)
    )) as APIPartialChannel[]
    if (allChannels?.length) {
      /** @ts-expect-error checking to make sure not undefined */
      return allChannels
        .filter((channel: APIPartialChannel) =>
          isHelpChannel(channel as TextChannel | ForumChannel)
        )
        .map((channel) => channel.name)
    }
  } catch (error) {
    console.error(`Error fetching guild channels ${guildId}: ${error.message}`)
  }
  return []
}

/** Currently not displaying community contributors but leaving this here in case it's wanted in the future */
// async function getCommunityContributors(): Promise<Contributor[]> {
//   try {
//     const data = await prisma.discordUser.findMany({
//       where: {
//         answers: {
//           some: {
//             participation: {
//               participantRoles: {
//                 none: {
//                   role: {
//                     accessLevelId: {
//                       in: [ACCESS_LEVELS.STAFF],
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       select: {
//         id: true,
//         answers: {
//           where: {
//             participation: {
//               participantRoles: {
//                 none: {
//                   role: {
//                     accessLevelId: {
//                       in: [ACCESS_LEVELS.STAFF],
//                     },
//                   },
//                 },
//               },
//             },
//           },
//           select: {
//             id: true,
//             createdAt: true,
//             question: {
//               select: {
//                 channelName: true,
//               },
//             },
//           },
//         },
//       },
//     })
//     /** @ts-expect-error mutating return object to have correct return type */
//     return Promise.all(
//       data.map(async (user) => {
//         user.answers = user.answers.map((answer) => {
//           answer['channelName'] = answer.question?.channelName ?? ''
//           delete answer.question
//           return answer
//         })
//         return user
//       })
//     )
//   } catch (error) {
//     console.error(`Failed to fetch community contributors: ${error.message}`)
//   }
//   return []
// }

async function getStaffContributors(guildId: string): Promise<Contributor[]> {
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
    console.error(`Failed to fetch staff contributors: ${error.message}`)
  }
  return []
}

async function getAllContributors(guildId: string): Promise<Contributor[]> {
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

export const load: PageServerLoad = async ({
  locals,
}): Promise<{
  channels: string[]
  contributors: Contributors
  gitHubStaff: GitHubUser[]
  memberCount: number
  name: string
  presenceCount: number
  questions: Questions
}> => {
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
      },
    })
  ).map((question) => {
    question.createdAt = question.createdAt.toString()
    return question
  })

  const guildPreview = (await api.get(
    Routes.guildPreview(guildId)
  )) as APIGuildPreview

  return {
    channels: await fetchHelpChannels(guildId),
    contributors: {
      all: await getAllContributors(guildId),
      staff: await getStaffContributors(guildId),
      // community: await getCommunityContributors(),
    },
    gitHubStaff: await getGitHubMembers(),
    memberCount: guildPreview?.approximate_member_count,
    name: guildPreview?.name,
    presenceCount: guildPreview?.approximate_presence_count,
    questions: {
      total: questions,
      unanswered: questions.filter((question) => !question.isSolved),
      staff: await getStaffAnswers(guildId),
      community: await getCommunityAnswers(guildId),
    },
  }
}
