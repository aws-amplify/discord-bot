import { PrismaClient } from '@prisma/client'
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
      email: 'esauerbo@amazon.com',
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
}

try {
  await seed()
} catch (error) {
  throw new Error(`Unable to seed database: ${error.message}`)
}
