import { Client, Intents, MessageEmbed } from 'discord.js'
import { createBank } from '@hey-amplify/discord'
import { PREFIXES } from './commands/thread'
import type {
  Message,
  StartThreadOptions,
  ThreadChannel,
  CommandInteraction,
} from 'discord.js'

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
  ],
})
export const commands = await createBank(
  new URL('./commands', import.meta.url).pathname
)

client.once('ready', () => {
  console.log('Ready!')
})

client.on('message', async (message: Message) => {
  // console.log('hello message', message, message.channel)
  // GuildChannelTypes.GUILD_TEXT
  if (
    !message.author.bot &&
    message.channel.type === 'GUILD_TEXT' &&
    (message.channel.name.startsWith('help-') ||
      message.channel.name.endsWith('-help'))
  ) {
    const options: StartThreadOptions = {
      name: `${PREFIXES.open}${message.content.slice(0, 140)}...`,
      autoArchiveDuration: 60,
    }
    const thread: ThreadChannel = await message.startThread(options)

    // TODO: should we *not* rewrite the owner to be OP? how does this affect their ability to rediscover questions?
    thread.ownerId = message.author.id

    // optionally send a message to the thread
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')
    // TODO: add more info on /thread command
    embed.setDescription(
      "Hey there! :wave: we've created a thread for you!\n\nUse `/thread rename` to change the title.\n\nUse `/thread solved` to mark this thread as solved."
    )
    thread.send({ embeds: [embed] })
  }
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
  if (response) {
    await interaction.reply(response)
  }
})

export function createBot(token = process.env.DISCORD_BOT_TOKEN) {
  return client.login(token)
}
