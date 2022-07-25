import { prisma } from '$lib/db'

export async function post({ request }) {
  const { id, name, adminRoles, staffRoles } = await request.json()
  const record = await prisma.configuration.findUnique({
    where: { id },
    include: {
      roles: true,
    },
  })

  if (record) {
    const adminRolesToDisconnect = record.roles.filter(
      (r) => !adminRoles.includes(r.id) && r.accessType === 'ADMIN'
    )
    const staffRolesToDisconnect = record.roles.filter(
      (r) => !staffRoles.includes(r.id) && r.accessType === 'STAFF'
    )
    const rolesToDisconnect = [
      ...adminRolesToDisconnect,
      ...staffRolesToDisconnect,
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
    ...adminRoles.map((id) => ({ discordRoleId: id, accessType: 'ADMIN' })),
    ...staffRoles.map((id) => ({ discordRoleId: id, accessType: 'STAFF' })),
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
