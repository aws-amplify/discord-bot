import * as path from 'node:path'
import { Client, Intents } from 'discord.js'
import { createBank } from '@hey-amplify/discord'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const bank = await createBank(new URL('./commands', import.meta.url).pathname)

console.log('HELLO')
client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const { commandName } = interaction
  const command = bank.get(commandName)
  console.log({ commandName, command })
  if (!command) return

  console.log(
    `Handling command "${command?.name}" for user ${interaction.member?.user?.id}`
  )

  let response = 'test'

  await interaction.reply(response)
})

// if (import.meta.env.PROD) {
//   client.login(process.env.DISCORD_BOT_TOKEN)
// }

function app() {
  return client.login(process.env.DISCORD_BOT_TOKEN)
}

export default app
