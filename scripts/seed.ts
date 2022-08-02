import { prisma } from '$lib/db'
import { faker } from '@faker-js/faker'
import type { Prisma } from '@prisma/client'

function createFakeQuestions(): Prisma.QuestionCreateInput[] {
  return Array.from({ length: 100 }).map((_, i) => ({
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
  }))
}

/**
 * general seed function for local database
 */
export async function seed() {
  for (const fakeQuestion of createFakeQuestions()) {
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
