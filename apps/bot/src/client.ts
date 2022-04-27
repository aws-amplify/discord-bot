import { Client, Intents } from 'discord.js'
import { createBank } from '@hey-amplify/discord'

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
export const commands = await createBank(
  new URL('./commands', import.meta.url).pathname
)

client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const { commandName } = interaction
  const command = commands.get(commandName)
  if (!command) {
    await interaction.reply(`Command not found 🤕`)
    return
  }

  console.log(
    `Handling command "${command?.name}" for ${interaction.user.username}#${interaction.user.discriminator}`
  )

  const response = await commands.handle(interaction)
  await interaction.reply(response)
})

export function createBot(token = process.env.DISCORD_BOT_TOKEN) {
  return client.login(token)
}
