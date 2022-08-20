import { prisma } from '$lib/db'
import { ACCESS_LEVELS } from '$lib/constants'
import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request }) => {
  const { id, name, adminRoles, staffRoles, contributorRoles } =
    await request.json()
  const record = await prisma.configuration.findUnique({
    where: { id },
    include: {
      roles: true,
    },
  })

  if (record) {
    const adminRolesToDisconnect = record.roles.filter(
      (r) =>
        !adminRoles.includes(r.id) && r.accessLevelId === ACCESS_LEVELS.ADMIN
    )
    const staffRolesToDisconnect = record.roles.filter(
      (r) =>
        !staffRoles.includes(r.id) && r.accessLevelId === ACCESS_LEVELS.STAFF
    )
    const contributorRolesToDisconnect = record.roles.filter(
      (r) =>
        !staffRoles.includes(r.id) &&
        r.accessLevelId === ACCESS_LEVELS.CONTRIBUTOR
    )
    const rolesToDisconnect = [
      ...adminRolesToDisconnect,
      ...staffRolesToDisconnect,
      ...contributorRolesToDisconnect,
    ]
    // delete old roles
    await prisma.accessLevelRole.deleteMany({
      where: {
        id: {
          in: rolesToDisconnect.map(({ id }) => id),
        },
      },
    })
  }

  const rolesToCreateOrUpdate = [
    ...adminRoles.map((id) => ({
      discordRole: {
        connectOrCreate: {
          where: { id },
          create: { id },
        },
      },
      accessLevel: {
        connectOrCreate: {
          where: { name: ACCESS_LEVELS.ADMIN },
          create: { name: ACCESS_LEVELS.ADMIN },
        },
      },
    })),
    ...staffRoles.map((id) => ({
      discordRole: {
        connectOrCreate: {
          where: { id },
          create: { id },
        },
      },
      accessLevel: {
        connectOrCreate: {
          where: { name: ACCESS_LEVELS.STAFF },
          create: { name: ACCESS_LEVELS.STAFF },
        },
      },
    })),
    ...contributorRoles.map((id) => ({
      discordRole: {
        connectOrCreate: {
          where: { id },
          create: { id },
        },
      },
      accessLevel: {
        connectOrCreate: {
          where: { name: ACCESS_LEVELS.CONTRIBUTOR },
          create: { name: ACCESS_LEVELS.CONTRIBUTOR },
        },
      },
    })),
  ]
  try {
    const config = await prisma.configuration.upsert({
      where: {
        id,
      },
      create: {
        id,
        name,
        roles: {
          create: rolesToCreateOrUpdate,
        },
      },
      update: {
        roles: {
          create: rolesToCreateOrUpdate,
        },
      },
      include: {
        roles: true,
      },
    })

    return {
      status: 200,
      body: config,
    }
  } catch (error) {
    console.error('Unable to update configuration', error)
    return {
      status: 500,
      body: [error],
    }
  }
}

export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json()
  return {
    body: await prisma.configuration.delete({
      where: { id },
    }),
  }
}
