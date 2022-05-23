import { Router, json } from 'express'
import { prisma } from './db'

export const api = Router()

api.use(json())
api.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

// List all questions (threads)
api.get('/questions', async (req, res) => {
  res.json(await prisma.question.findMany())
})

api.get('/admin/configure', async (req, res) => {
  const { guildId: id } = req.query
  const config = await prisma.configuration.findUnique({
    where: { id },
    include: {
      adminRoles: true,
    },
  })
  res.json(config || {})
})

api.post('/admin/configure', async (req, res) => {
  const { id, name, adminRoles } = req.body
  const record = await prisma.configuration.findUnique({
    where: { id },
    include: {
      adminRoles: true,
    },
  })

  if (record) {
    const adminRolesToDisconnect = record.adminRoles.filter(
      (r) => !adminRoles.includes(r.id)
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
        create: adminRoles.map((id) => ({ id })),
      },
    },
    update: {
      adminRoles: {
        connectOrCreate: adminRoles.map((id) => ({
          where: { id },
          create: { id },
        })),
      },
    },
    include: {
      adminRoles: true,
    },
  })

  res.json(config)
})

api.delete('/admin/configure', async (req, res) => {
  const { body } = req
  res.json(
    await prisma.configuration.delete({
      where: { id: body.id },
    })
  )
})
