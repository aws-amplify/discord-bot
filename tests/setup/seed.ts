import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function seed() {
  const user1 = await prisma.user.upsert({
    where: {
      id: 'cl4n0kjqd0006iqtda15yzzcw',
    },
    update: {},
    create: {
      id: 'cl4n0kjqd0006iqtda15yzzcw',
      name: 'emma',
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
            access_token: process.env.GITHUB_TESTING_ACCESS_TOKEN,
          },
        ],
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: {
      id: 'adsqd0006iqtda15yzz',
    },
    update: {},
    create: {
      id: 'adsqd0006iqtda15yzz',
      name: 'josef',
      image: 'https://cdn.discordapp.com/embed/avatars/0.png',
      accounts: {
        create: [
          {
            id: 'dsafn0kjqi000s3lk091',
            type: 'oauth',
            provider: 'discord',
            providerAccountId: '143912968529117185',
          },
          {
            id: 'qerkl12p2u0074wbeywasd',
            type: 'oauth',
            provider: 'github',
            providerAccountId: '5033303',
            access_token: process.env.GITHUB_TESTING_ACCESS_TOKEN,
          },
        ],
      },
    },
  })
}
<<<<<<< HEAD
=======

try {
  await seed()
} catch (error) {
  throw new Error(`Unable to seed database: ${error.message}`)
}
>>>>>>> origin
