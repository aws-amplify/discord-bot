import { faker } from '@faker-js/faker'
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
  const access = Object.values(ACCESS_LEVELS)
  return Array.from({ length: 10 }).map((_, i) => {
    const id = faker.random.numeric(18)
    const name = access[Math.floor(Math.random() * access.length)]
    return {
      id,
      role: {
        create: {
          accessLevel: {
            connect: {
              name,
            },
          },
        },
      },
    }
  })
}

async function getRandomFakeRole(): Promise<DiscordRole> {
  const [role] = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "DiscordRole" ORDER BY RANDOM() LIMIT 1;`
  )) as DiscordRole[]

  return role
}

/**
 * @TODO accept argument for list length?
 */
function createFakeQuestions(
  length = 100
): Promise<Prisma.QuestionCreateInput[]> {
  return Promise.all(
    Array.from({ length }).map(async (_, i) => {
      const input: Prisma.QuestionCreateInput = {
        threadId: `999770${faker.random.numeric(12)}`,
        ownerId: '143912968529117185',
        channelName: 'cli-help',
        title: faker.random.words(15),
        isSolved: faker.datatype.boolean(),
        url: 'https://discord.com/channels/976838371383083068/976838372205137982/999770893356122152',
        createdAt: faker.date.recent(10),
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
                id: (await getRandomFakeUser()).id,
              },
            },
            participantRoles: {
              connect: {
                id: (await getRandomFakeRole()).id,
              },
            },
          },
        },
      }

      if (faker.datatype.boolean()) {
        input.answer = {
          create: {
            content: faker.random.words(15),
            selectedBy: (await getRandomFakeUser()).id,
            createdAt: faker.date.recent(10, input.createdAt),
            owner: {
              connect: {
                id: (await getRandomFakeUser()).id,
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

/**
 * general seed function for local database
 */
export async function seed() {
  await init()
  for (const fakeUser of createFakeUsers()) {
    await prisma.discordUser.create({
      data: fakeUser,
    })
  }
  for (const fakeRole of createFakeRoles()) {
    await prisma.discordRole.create({
      data: fakeRole,
    })
  }
  for (const fakeQuestion of await createFakeQuestions()) {
    await prisma.question.create({
      data: fakeQuestion,
    })
  }
}

try {
  await seed()
} catch (error) {
  throw new Error(`Unable to seed database: ${error.message}`)
}
