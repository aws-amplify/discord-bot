import type { RequestHandler } from '@sveltejs/kit'
import { Routes } from 'discord-api-types/v10'
import { api } from '$discord'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { isHelpChannel } from '$lib/discord/support'
import type { APIPartialChannel, APIGuildPreview } from 'discord-api-types/v10'
import type { TextChannel } from 'discord.js'
import type { Contributor } from './types'

const guildId = import.meta.env.VITE_DISCORD_GUILD_ID
const GUILD_TEXT_CHANNEL = 0

async function getDiscordUsername(userId: string) {
  try {
    const guildMember = (await api.get(Routes.guildMember(guildId, userId))) as
      | APIGuildMember
      | undefined
    if (guildMember?.nick) return guildMember.nick
    if (guildMember?.user?.username) return guildMember.user.username
  } catch (error) {
    console.error(`Failed to fetch discord username: ${error.message}`)
  }
  return 'unknown discord user'
}

async function fetchHelpChannels() {
  try {
    const allChannels = (await api.get(
      Routes.guildChannels(guildId)
    )) as APIPartialChannel[]
    if (allChannels) {
      const filtered = allChannels
        .filter(
          (channel: APIPartialChannel) =>
            channel.type === GUILD_TEXT_CHANNEL &&
            isHelpChannel(channel as TextChannel)
        )
        .map((channel) => channel.name)
      return filtered
    }
  } catch (error) {
    console.error(`Error fetching guild channels ${guildId}: ${error.message}`)
  }
  return []
}

async function getCommunityContributors(): Promise<Contributor[]> {
  try {
    const data = await prisma.discordUser.findMany({
      where: {
        answers: {
          some: {
            participation: {
              participantRoles: {
                some: {
                  role: {
                    accessLevelId: {
                      notIn: [ACCESS_LEVELS.STAFF],
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
                some: {
                  role: {
                    accessLevelId: {
                      notIn: [ACCESS_LEVELS.STAFF],
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
    /** @ts-expect-error mutating to include chanelName */
    return Promise.all(
      data.map(async (user) => {
        user['discordUsername'] = await getDiscordUsername(user.id)
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

async function getStaffContributors(): Promise<Contributor[]> {
  try {
    const data = await prisma.discordUser.findMany({
      where: {
        answers: {
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
    /** @ts-expect-error mutating to include chanelName */
    return Promise.all(
      data.map(async (user) => {
        user['discordUsername'] = await getDiscordUsername(user.id)
        user['githubId'] =
          user.account?.user?.accounts[0]?.providerAccountId ?? null
        delete user.account
        user.answers = user.answers.map((answer) => {
          answer['channelName'] = answer.question?.channelName ?? ''
          delete answer.question
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

async function getStaffAnswers() {
  try {
    const data = await prisma.answer.findMany({
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
    })
    return data.map((answer) => {
      answer['channelName'] = answer.question?.channelName ?? ''
      delete answer.question
      return answer
    })
  } catch (error) {
    console.error(`Failed to fetch staff answers ${error.message}`)
  }
  return []
}

async function getCommunityAnswers() {
  try {
    const data = await prisma.answer.findMany({
      where: {
        participation: {
          participantRoles: {
            some: {
              role: {
                accessLevelId: {
                  notIn: [ACCESS_LEVELS.STAFF],
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
    return data.map((answer) => {
      answer['channelName'] = answer.question?.channelName ?? ''
      delete answer.question
      return answer
    })
  } catch (error) {
    console.error(`Failed to fetch staff answers ${error.message}`)
  }
}

export const GET: RequestHandler = async () => {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      createdAt: true,
      channelName: true,
      isSolved: true,
    },
  })

  const guildPreview = (await api.get(
    Routes.guildPreview(guildId)
  )) as APIGuildPreview

  return {
    status: 200,
    body: {
      channels: await fetchHelpChannels(),
      contributors: {
        staff: await getStaffContributors(),
        community: await getCommunityContributors(),
      },
      memberCount: guildPreview?.approximate_member_count,
      name: guildPreview?.name,
      presenceCount: guildPreview?.approximate_presence_count,
      questions: {
        total: questions,
        unanswered: questions.filter((question) => !question.isSolved),
        staff: await getStaffAnswers(),
        community: await getCommunityAnswers(),
      },
    },
  }
}
