import { PrismaClient } from '@prisma/client'
import { ACCESS_LEVELS } from '$lib/constants'
import { init } from '$lib/db'
const prisma = new PrismaClient()

export async function seed() {
  await prisma.user.upsert({
    where: {
      email: 'esauerbo@amazon.com',
    },
    update: {},
    create: {
      id: 'cl4n0kjqd0006iqtda15yzzcw',
      name: 'esauerbo',
      email: 'esauerbo@fake.com',
      image: 'https://cdn.discordapp.com/embed/avatars/0.png',
      accounts: {
        create: [
          {
            id: 'cl4n0kjqi0013iqtdzg0s37k1',
            type: 'oauth',
            provider: 'discord',
            providerAccountId: '985985131271585833',
          },
          {
            id: 'cl5bbdp2u0074wbtdkn2a2eyw',
            type: 'oauth',
            provider: 'github',
            providerAccountId: '107655607',
          },
        ],
      },
    },
  })

  const STAFF_ROLE = '1001228846768590934'
  const CONTRIBUTOR_ROLE = '1001228846768590931'
  await prisma.configuration.upsert({
    where: { id: import.meta.env.VITE_DISCORD_GUILD_ID },
    update: {},
    create: {
      name: 'hey-amplify-e2e',
      roles: {
        create: [
          {
            id: STAFF_ROLE,
            accessLevel: {
              connect: {
                name: ACCESS_LEVELS.STAFF,
                // where: { name: ACCESS_LEVELS.STAFF },
              },
            },
            discordRole: {
              connectOrCreate: {
                where: { id: STAFF_ROLE },
                create: { id: STAFF_ROLE },
              },
            },
          },
          {
            id: CONTRIBUTOR_ROLE,
            accessLevel: {
              connect: {
                name: ACCESS_LEVELS.CONTRIBUTOR,
              },
            },
            discordRole: {
              connectOrCreate: {
                where: { id: CONTRIBUTOR_ROLE },
                create: { id: CONTRIBUTOR_ROLE },
              },
            },
          },
        ],
      },
      guild: {
        connectOrCreate: {
          where: { id: import.meta.env.VITE_DISCORD_GUILD_ID },
          create: { id: import.meta.env.VITE_DISCORD_GUILD_ID },
        },
      },
    },
  })
}

beforeAll(async () => {
  try {
    await init()
    await seed()
    console.log('[test] Database seeded')
  } catch (error) {
    throw new Error(`Unable to seed database: ${error.message}`)
  }
})
