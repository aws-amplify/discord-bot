import { Client, Intents, MessageEmbed } from 'discord.js'
import { createBank } from '@hey-amplify/discord'
import type {
  Message,
  StartThreadOptions,
  ThreadChannel,
  CommandInteraction,
} from 'discord.js'
import { PREFIXES } from './commands/thread'
import { prisma } from '$lib/db'

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
      const record = await prisma.question.create({
        data: {
          ownerId: message.author.id,
          threadId: thread.id,
          channelName: message.channel.name,
          title: message.content,
          createdAt: thread.createdAt as Date,
          url: message.url,
        },
      })
      console.info(`Created question ${record.id}`)
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

  // capture thread updates in public "help" channels
  if (
    message.channel.type === 'GUILD_PUBLIC_THREAD' &&
    !message.author.bot &&
    (message.channel.parent?.name.startsWith('help-') ||
      message.channel.parent?.name.endsWith('-help'))
  ) {
    const record = await prisma.question.upsert({
      where: { threadId: message.channel.id },
      update: { threadMetaUpdatedAt: message.createdAt as Date },
      create: {
        ownerId: message.author.id,
        threadId: message.channel.id,
        channelName: message.channel.name,
        title: message.content,
        createdAt: message.createdAt as Date,
        url: message.url,
      },
    })
    console.info(`Created/updated question ${record.id}`)
  }
})

client.on('interactionCreate', async interaction => {
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

client.on('rateLimit', info => {
  console.log(
    `Rate limit hit ${info.timeout ? info.timeout : 'Unknown timeout '}`
  )
})

client.on('threadUpdate', async thread => {
  console.log(`Thread ${thread.id} updated`)
})

export function createBot(token = process.env.DISCORD_BOT_TOKEN) {
  console.log(process.env);
  return client.login(token)
}
