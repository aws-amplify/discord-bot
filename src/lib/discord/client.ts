import { Client, Intents, MessageEmbed, Modal } from 'discord.js'
import { createDiscordCommandBank } from '$discord'
import type {
  ButtonInteraction,
  Message,
  ModalSubmitInteraction,
  StartThreadOptions,
  ThreadChannel,
} from 'discord.js'
import { prisma } from '$lib/db'
// manually import the commands
import giverole from './commands/giverole'
import contribute from './commands/contribute'
import thread, { PREFIXES } from './commands/thread'
import github from './commands/github'
import * as fileAnIssue from './actions/file-an-issue'

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
  ],
})

// instead of using `createBank` helper to create command bank from a directory path, create it manually with the imported commands
export const commands = createDiscordCommandBank([
  giverole,
  contribute,
  thread,
  github,
])

client.once('ready', () => {
  console.log('Bot Ready!')
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

    thread.send({ embeds: [embed], components: [fileAnIssue.row] })
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

client.on('interactionCreate', async (interaction) => {
  // handle buttons
  if (interaction.isButton()) {
    interaction as ButtonInteraction
    if (interaction.customId === fileAnIssue.button.customId) {
      await fileAnIssue.buttonHandler(interaction)
    }
  }

  if (interaction.isModalSubmit()) {
    interaction as ModalSubmitInteraction
    // TODO: multiple modal handlers?
    fileAnIssue.modalHandler(interaction)
  }

  // handle slash commands
  if (interaction.isCommand()) {
    const { commandName } = interaction
    console.log('Handling interaction for command', commandName)
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
  }
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
