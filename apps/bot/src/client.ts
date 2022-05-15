import { Client, Intents, MessageEmbed } from 'discord.js'
import { createBank } from '@hey-amplify/discord'
import type {
  Message,
  StartThreadOptions,
  ThreadChannel,
  CommandInteraction,
} from 'discord.js'
import { PREFIXES } from './commands/thread'
import { prisma } from './db'

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

client.on('messageCreate', async (message: Message) => {
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

    // create Question in db
    try {
      await prisma.question.create({
        data: {
          ownerId: message.author.id,
          threadId: thread.id,
          channelName: message.channel.name,
          title: message.content,
          createdAt: thread.createdAt as Date,
          url: message.url,
        },
      })
    } catch (error) {
      console.error('Unable to create Question in db', error)
    }

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
  return
})

client.on('rateLimit', (info) => {
  console.log(
    `Rate limit hit ${info.timeout ? info.timeout : 'Unknown timeout '}`
  )
})

client.on('threadUpdate', async (thread) => {
  console.log(`Thread ${thread.id} updated`)
})

export function createBot(token = process.env.DISCORD_BOT_TOKEN) {
  return client.login(token)
}
