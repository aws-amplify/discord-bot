import { prisma } from './db'

export class Audit {
  constructor() {
    //
  }

  async log(action) {
    const record = await prisma.auditLog.create({
      data: {
        ...action,
      },
      select: {
        id: true,
      },
    })
    return record.id
  }
}

export const audit = new Audit()
