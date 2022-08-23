import type { RequestHandler } from '@sveltejs/kit'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { Routes } from 'discord-api-types/v10'
import { api } from '$discord'
import { ACCESS_LEVELS } from '$lib/constants'
import { prisma } from '$lib/db'
import { isHelpChannel } from '$lib/discord/support'
import type { APIPartialChannel, APIGuildPreview } from 'discord-api-types/v10'
import type { TextChannel } from 'discord.js'
import type { Contributor, Question } from './types'

const guildId = import.meta.env.VITE_DISCORD_GUILD_ID
const GUILD_TEXT_CHANNEL = 0

async function authenticate() {
  const { privateKey } = JSON.parse(process.env.GITHUB_PRIVATE_KEY)
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: privateKey,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  })
  try {
    const { token } = await auth({
      type: 'installation',
      installationId: process.env.GITHUB_INSTALLATION_ID,
    })
    return token
  } catch (err) {
    console.error(`Error fetching installation token: ${err}`)
  }
  return null
}

export async function getGitHubMembers() {
  const token = await authenticate()
  const octokit = new Octokit({
    auth: `token ${token}`,
  })
  try {
    const { data } = await octokit.request('GET /orgs/{org}/members', {
      org: process.env.GITHUB_ORG_LOGIN,
    })
    return data
  } catch (error) {
    console.error(`Error getting github members ${error.message}`)
  }
  return []
}

async function fetchHelpChannels(): Promise<string[]> {
  try {
    const allChannels = (await api.get(
      Routes.guildChannels(guildId)
    )) as APIPartialChannel[]
    if (allChannels?.length) {
      /** @ts-expect-error checking to make sure not undefined */
      return allChannels
        .filter(
          (channel: APIPartialChannel) =>
            channel.type === GUILD_TEXT_CHANNEL &&
            isHelpChannel(channel as TextChannel)
        )
        .map((channel) => channel.name)
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
    /** @ts-expect-error mutating return object to have correct return type */
    return Promise.all(
      data.map(async (user) => {
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

async function getStaffAnswers(): Promise<Question[]> {
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
    /** @ts-expect-error mutating return object to have correct return type */
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

async function getCommunityAnswers(): Promise<Question[]> {
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
    /** @ts-expect-error mutating return object to have correct return type */
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
      gitHubStaff: await getGitHubMembers(),
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
