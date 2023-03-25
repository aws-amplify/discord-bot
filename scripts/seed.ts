import { faker } from '@faker-js/faker'
import task from 'tasuku'
import { prisma, init } from '$lib/db'
import { ACCESS_LEVELS } from '$lib/constants'
import type { DiscordUser, DiscordRole, Prisma } from '@prisma/client'

function createFakeUsers(): Prisma.DiscordUserCreateInput[] {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: faker.random.numeric(18),
  }))
}

async function getRandomFakeUser(): Promise<DiscordUser> {
  const [user] = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "DiscordUser" ORDER BY RANDOM() LIMIT 1;`
  )) as DiscordUser[]

  return user
}

function createFakeRoles(): Prisma.DiscordRoleCreateInput[] {
  const roles: Prisma.DiscordRoleCreateInput[] = []
  for (const name of Object.values(ACCESS_LEVELS)) {
    roles.push({
      id: faker.random.numeric(18),
      role: {
        create: {
          accessLevel: {
            connect: {
              name,
            },
          },
        },
      },
    })
  }
  return roles
}

async function getRandomFakeRole(): Promise<DiscordRole> {
  const [role] = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "DiscordRole" ORDER BY RANDOM() LIMIT 1;`
  )) as DiscordRole[]

  return role
}

const CHANNELS = [
  'android-help',
  'authentication-help',
  'cli-help',
  'cloudformation-help',
  'container-help',
  'datastore-help',
  'flutter-help',
  'geo-help',
  'graphql-help',
  'ios-help',
  'js-help',
  'lambda-help',
  'next-js-ssr-help',
  'opensearch-help',
  'studio-help',
  'ui-help',
]

const TAGS = [
  'android',
  'auth',
  'cli',
  'cloudformation',
  'containers',
  'datastore',
  'flutter',
  'geo',
  'graphql',
  'ios',
  'js',
  'lambda',
]

function getRandomValue(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}
function getRandomChannel(): string {
  return getRandomValue(CHANNELS)
}
function getRandomTag(): string {
  return getRandomValue(TAGS)
}

function shouldAdd(odds = 0.5): boolean {
  return Math.random() < odds
}

/**
 * @TODO accept argument for list length?
 */
function createFakeQuestions(
  length = 3000
): Promise<Prisma.QuestionCreateInput[]> {
  return Promise.all(
    Array.from({ length }).map(async (_, i) => {
      const randomFakeUser = await getRandomFakeUser()
      const randomFakeRole = await getRandomFakeRole()
      const randomTag = getRandomTag()
      const input: Prisma.QuestionCreateInput = {
        threadId: `999770${faker.random.numeric(12)}`,
        ownerId: '143912968529117185',
        channelName: getRandomChannel(),
        title: faker.random.words(15),
        isSolved: shouldAdd(0.9),
        url: 'https://discord.com/channels/976838371383083068/976838372205137982/999770893356122152',
        createdAt: faker.date.recent(100),
        tags: shouldAdd(0.9)
          ? {
              connectOrCreate: [
                {
                  where: {
                    name: randomTag,
                  },
                  create: {
                    id: `999770${faker.random.numeric(12)}`,
                    name: randomTag,
                  },
                },
              ],
            }
          : undefined,
        guild: {
          connectOrCreate: {
            where: {
              id: import.meta.env.VITE_DISCORD_GUILD_ID,
            },
            create: {
              id: import.meta.env.VITE_DISCORD_GUILD_ID,
            },
          },
        },
        participation: {
          create: {
            id: faker.datatype.uuid(),
            participant: {
              connect: {
                id: randomFakeUser.id,
              },
            },
            participantRoles: {
              connect: {
                id: randomFakeRole.id,
              },
            },
          },
        },
      }

      if (shouldAdd(0.8)) {
        input.answer = {
          create: {
            content: faker.random.words(15),
            selectedBy: randomFakeUser.id,
            createdAt: faker.date.recent(10, input.createdAt),
            owner: {
              connect: {
                id: randomFakeUser.id,
              },
            },
            participation: {
              connect: {
                // @ts-expect-error we know this is a valid id
                id: input.participation.create.id,
              },
            },
          },
        }
      }

      return input
    })
  )
}

type SeedOptions = {
  /**
   * @default 3000
   */
  questions: number
}

/**
 * general seed function for local database
 */
export async function seed(options?: SeedOptions) {
  const amountOfFakeQuestions = options?.questions ?? 3000
  await init()
  task('create users', async () => {
    return Promise.all(
      createFakeUsers().map((user) => prisma.discordUser.create({ data: user }))
    )
  })
  task('create roles', async () => {
    return Promise.all(
      createFakeRoles().map((role) => prisma.discordRole.create({ data: role }))
    )
  })
  task('create questions', async ({ setTitle }) => {
    let count = 0
    for (const fakeQuestion of await createFakeQuestions(
      amountOfFakeQuestions
    )) {
      await prisma.question.create({
        data: fakeQuestion,
      })
      count++
      setTitle(`create questions (${count}/${amountOfFakeQuestions})`)
    }
  })
}

try {
  await seed()
} catch (error) {
  throw new Error(`Unable to seed database: ${error.message}`)
}
