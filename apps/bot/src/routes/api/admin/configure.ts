import { prisma } from '../../../db'

export async function get(event) {
  const { guildId: id } = event.url.searchParams
  const config = await prisma.configuration.findUnique({
    where: { id },
    include: {
      adminRoles: true,
    },
  })

  if (!config) {
    return {
      status: 500,
    }
  }

  return {
    status: 200,
    body: config,
  }
}

export async function post(event) {
  const { id, name, adminRoles } = event.request.body
  const record = await prisma.configuration.findUnique({
    where: { id },
    include: {
      adminRoles: true,
    },
  })

  if (record) {
    const adminRolesToDisconnect = record.adminRoles.filter(
      r => !adminRoles.includes(r.id)
    )
    await prisma.configuration.update({
      where: { id },
      data: {
        adminRoles: {
          disconnect: adminRolesToDisconnect.map(({ id }) => ({ id })),
        },
      },
      include: {
        adminRoles: true,
      },
    })
  }

  const config = await prisma.configuration.upsert({
    where: {
      id,
    },
    create: {
      id,
      name,
      adminRoles: {
        create: adminRoles.map(id => ({ id })),
      },
    },
    update: {
      adminRoles: {
        connectOrCreate: adminRoles.map(id => ({
          where: { id },
          create: { id },
        })),
      },
    },
    include: {
      adminRoles: true,
    },
  })

  return {
    status: 200,
    body: config,
  }
}

export async function del(event) {
  const { body } = event
  return {
    body: await prisma.configuration.delete({
      where: { id: body.id },
    }),
  }
}
