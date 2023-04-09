import { Events, Message } from 'discord.js'
import { createBot } from '@hey-amplify/discord'
import type { Client } from 'discord.js'

let bot: Client
beforeAll(async () => {
  bot = await createBot()
})

afterAll(() => {
  bot?.destroy()
})

describe('discord-bot', () => {
  // TODO: add tests
  it('should respond', async () => {
    // bot.emit(Events.MessageCreate, {
    // })
  })
})
