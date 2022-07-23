import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function seed() {
  await prisma.question.upsert({
    where: {
      id: 'cl5vgzv8i0012z6r7lba6zuvg',
    },
    update: {},
    create: {
      id: 'cl5vgzv8i0012z6r7lba6zuvg',
      threadId: '999770893356122152',
      ownerId: '143912968529117185',
      channelName: 'cli-help',
      createdAt: '2022-07-21T20:12:36.084Z',
      updatedAt: '2022-07-21T20:12:36.450Z',
      threadMetaUpdatedAt: '2022-07-21T20:12:36.450Z',
      title: 'How do I upgrade the CLI?',
      isSolved: false,
      url: 'https://discord.com/channels/976838371383083068/976838372205137982/999770893356122152',
    },
  })
}

try {
  await seed()
} catch (error) {
  throw new Error(`Unable to seed database: ${error.message}`)
}
