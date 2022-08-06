import { prisma } from '$lib/db'
import { AccessType } from '$lib/configure'

export async function post({ request }) {
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
      (r) => !adminRoles.includes(r.id) && r.accessType === AccessType.ADMIN
    )
    const staffRolesToDisconnect = record.roles.filter(
      (r) => !staffRoles.includes(r.id) && r.accessType === AccessType.STAFF
    )
    const contributorRolesToDisconnect = record.roles.filter(
      (r) =>
        !contributorRoles.includes(r.id) &&
        r.accessType === AccessType.CONTRIBUTOR
    )
    const rolesToDisconnect = [
      ...adminRolesToDisconnect,
      ...staffRolesToDisconnect,
      ...contributorRolesToDisconnect,
    ]
    // delete old roles
    await prisma.role.deleteMany({
      where: {
        id: {
          in: rolesToDisconnect.map(({ id }) => id),
        },
      },
    })
  }

  const rolesToCreateOrUpdate = [
    ...adminRoles.map((id) => ({
      discordRoleId: id,
      accessType: AccessType.ADMIN,
    })),
    ...staffRoles.map((id) => ({
      discordRoleId: id,
      accessType: AccessType.STAFF,
    })),
    ...contributorRoles.map((id) => ({
      discordRoleId: id,
      accessType: AccessType.CONTRIBUTOR,
    })),
  ]
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
}

export async function del({ request }) {
  const { id } = await request.json()
  return {
    body: await prisma.configuration.delete({
      where: { id },
    }),
  }
}
