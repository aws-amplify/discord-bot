import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ChannelType,
} from 'discord.js'
import { createDiscordCommandBank } from '$discord'
import { prisma } from '$lib/db'
// manually import the commands
import giverole from './commands/giverole'
import contribute from './commands/contribute'
import thread, { PREFIXES } from './commands/thread'
import github from './commands/github'
import * as selectAnswer from './commands/select-answer'
import { isHelpChannel, isThreadWithinHelpChannel } from './support'
import type { Message, StartThreadOptions, ThreadChannel } from 'discord.js'

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
})

// instead of using `createBank` helper to create command bank from a directory path, create it manually with the imported commands
export const commands = createDiscordCommandBank([
  giverole,
  contribute,
  thread,
  github,
])

try {
  // TODO: command bank to support context menu commands, until then let's manually add it
  commands.set('select-answer', {
    ...selectAnswer.config,
    // @ts-expect-error - hack to add non-slash command to command bank
    handler: selectAnswer.handler,
  })
  await commands.register(selectAnswer.config.toJSON())
  console.info('Registered selectAnswer command')
} catch (error) {
  console.error(error)
  throw new Error(`Unable to register selectAnswer command`)
}

client.once('ready', async () => {
  console.log('Bot Ready!')
  for (const guild of client.guilds.cache.values()) {
    try {
      await prisma.guild.upsert({
        where: {
          id: guild.id,
        },
        create: {
          id: guild.id,
        },
        update: {},
      })
    } catch (error) {
      console.error('Error upserting guild', error)
    }
  }
})

/**
 * Create Guild model when bot joins a new guild
 */
client.on('guildCreate', async (guild) => {
  try {
    await prisma.guild.upsert({
      where: {
        id: guild.id,
      },
      create: {
        id: guild.id,
      },
      update: {},
    })
  } catch (error) {
    console.error('Error upserting guild', error)
  }
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return
  if (oldMessage.content === newMessage.content || !newMessage.content) return
  if (oldMessage.channel.type !== ChannelType.GuildPublicThread) return

  // update answer contents if exists
  const answer = await prisma.answer.update({
    where: {
      id: oldMessage.id,
    },
    data: {
      content: newMessage.content,
    },
    select: {
      id: true,
    },
  })
  console.log('Updated answer content:', answer.id)
})

client.on('messageCreate', async (message: Message) => {
  if (
    !message.author.bot &&
    message.channel.type === 'GUILD_TEXT' &&
    isHelpChannel(message.channel)
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
          guild: {
            connect: {
              id: message.guild?.id,
            },
          },
        },
      })
      console.info(`Created question ${record.id}`)
    } catch (error) {
      console.error('Unable to create Question in db', error)
    }

    // optionally send a message to the thread
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    // TODO: add more info on /thread command
    embed.setDescription(
      "Hey there! :wave: we've created a thread for you!\n\nUse `/thread rename` to change the title.\n\nUse `/thread solved` to mark this thread as solved."
    )
    thread.send({ embeds: [embed] })
  }

  // capture thread updates in public "help" channels
  if (
    message.channel.type === ChannelType.GuildPublicThread &&
    !message.author.bot &&
    isThreadWithinHelpChannel(message.channel)
  ) {
    const record = await prisma.question.upsert({
      where: { threadId: message.channel.id },
      update: { threadMetaUpdatedAt: message.createdAt as Date },
      create: {
        ownerId: message.channel.ownerId as string,
        threadId: message.channel.id,
        channelName: message.channel.parent.name,
        title: message.content,
        createdAt: message.channel.createdAt as Date,
        url: message.url,
        guild: {
          connect: {
            id: message.guild?.id,
          },
        },
      },
    })
    console.info(`Created/updated question ${record.id}`)
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const { commandName } = interaction
  console.log('Handling interaction for command', commandName)
  const command = commands.get(commandName)
  if (!command) {
    await interaction.reply({
      content: `Command not found 🤕`,
      ephemeral: true,
    })
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

// capture SIGINT (Ctrl+C) to gracefully shutdown
process.on('SIGINT', () => {
  console.log('destroying client')
  client?.destroy()
  process.exit(0)
})
