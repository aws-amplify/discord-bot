import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ChannelType,
  Events,
  type Interaction,
  type Message,
  type StartThreadOptions,
  type ThreadChannel,
  type Guild,
} from 'discord.js'
import { prisma } from '$lib/db'
import {
  commands,
  createCommandFeatures,
  syncRegisteredCommandsForGuild,
} from './commands'
import { PREFIXES } from './commands/thread'
import { isHelpChannel, isThreadWithinHelpChannel } from './support'
import { integrations } from '$lib/features/index'
import { FEATURE_TYPES } from '$lib/constants'
import type { Question } from '@prisma/client'

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
})

const initGuild = async (guild: Guild) => {
  return prisma.guild.upsert({
    where: {
      id: guild.id,
    },
    create: {
      id: guild.id,
      configuration: {
        create: {
          name: guild.name,
          // initialize guild with all features disabled (commands, integrations, etc.)
          features: {
            connectOrCreate: [
              ...integrations,
              ...createCommandFeatures().map((c) => ({
                ...c,
                type: FEATURE_TYPES.COMMAND,
              })),
            ].map((f) => ({
              where: {
                configurationId_featureCode: {
                  configurationId: guild.id,
                  featureCode: f.code,
                },
              },
              create: {
                enabled: false,
                feature: {
                  connect: {
                    code: f.code,
                  },
                },
              },
            })),
          },
        },
      },
    },
    update: {
      configuration: {
        update: {
          name: guild.name,
        },
      },
    },
  })
}

client.once(Events.ClientReady, async () => {
  console.log('Bot Ready!')
  if (import.meta.env.DEV) {
    // delete all global commands
    await client.application?.commands.set([])
  }
  for (const guild of client.guilds.cache.values()) {
    try {
      await initGuild(guild)
      await syncRegisteredCommandsForGuild(guild.id)
    } catch (error) {
      console.error('Error upserting guild', error)
    }
  }
})

/**
 * Create Guild model when bot joins a new guild
 */
client.on(Events.GuildCreate, async (guild: Guild) => {
  try {
    await initGuild(guild)
    await syncRegisteredCommandsForGuild(guild.id)
  } catch (error) {
    console.error('Error upserting guild', error)
  }
})

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return
  if (oldMessage.content === newMessage.content || !newMessage.content) return
  if (oldMessage.channel.type !== ChannelType.PublicThread) return

  // ensure message is within a help channel thread
  if (isThreadWithinHelpChannel(oldMessage.channel)) {
    // update answer contents if exists
    try {
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
    } catch (error) {
      console.error(`Error updating answer (${oldMessage.id}) content:`, error)
    }
  }
})

client.on(Events.MessageCreate, async (message: Message) => {
  // ignore bot messages
  if (message.author.bot) return

  /**
   * Automatically create a thread when new messages are posted to "help" channels
   */
  if (
    message.channel.type === ChannelType.GuildText &&
    isHelpChannel(message.channel)
  ) {
    const options: StartThreadOptions = {
      name: `${PREFIXES.open}${message.content.slice(0, 90)}...`,
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

   // TODO: Determine if we still need this if statement, it also creates a thread and can lead to data duplication in DB. Commented out for now
  // capture thread updates in public "help" channels
 
//   if (
//     message.channel.type === ChannelType.PublicThread &&
//     !message.author.bot &&
//     isThreadWithinHelpChannel(message.channel)
//   ) {
//     let record
//     try {
//       /**
//        * @TODO if we need to backfill the question, we'll need to fetch all messages from the thread first
//        */
//       record = await prisma.question.upsert({
//         where: { threadId: message.channel.id },
//         update: {
//           threadMetaUpdatedAt: message.createdAt as Date,
//         },
//         create: {
//           ownerId: (
//             await message.channel.fetchStarterMessage()
//           ).author.id as string,
//           threadId: message.channel.id,
//           channelName: message.channel.parent!.name,
//           title: message.channel.name,
//           createdAt: message.channel.createdAt as Date,
//           url: message.url,
//           isSolved: message.channel.name.startsWith(PREFIXES.solved),
//           guild: {
//             connect: {
//               id: message.guild?.id,
//             },
//           },
//         },
//         select: {
//           id: true,
//           ownerId: true,
//         },
//       })
//       console.info(`Created/updated question ${record.id}`)
//     } catch (error) {
//       console.error('Unable to create/update Question in db', error)
//     }

//     try {
//       /**
//        * add the participants separately
//        */
//       if (record) {
//         const roleIds = message.member?.roles.cache.map((role) => role.id)
//         await prisma.question.update({
//           where: {
//             id: record.id,
//           },
//           data: {
//             // participation record
//             participation: {
//               connectOrCreate: {
//                 where: {
//                   questionId_participantId: {
//                     questionId: record.id,
//                     participantId: message.author.id,
//                   },
//                 },
//                 create: {
//                   // DiscordUser
//                   participant: {
//                     connectOrCreate: {
//                       where: { id: message.author.id },
//                       create: {
//                         id: message.author.id,
//                       },
//                     },
//                   },
//                   // capture roles of the participant at the time of participating
//                   participantRoles: {
//                     connectOrCreate: roleIds?.map((id) => ({
//                       where: {
//                         id: id,
//                       },
//                       create: {
//                         id: id,
//                       },
//                     })),
//                   },
//                 },
//               },
//             },
//           },
//         })
//         console.log(
//           `Successfully updated participants for question ${record.id}`
//         )
//       }
//     } catch (error) {
//       console.error(`Unable to update participants`, error)
//     }
//   }
})

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
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

  await command.handle(interaction)
})

client.on('rateLimit', (info) => {
  console.log(
    `Rate limit hit ${info.timeout ? info.timeout : 'Unknown timeout '}`
  )
})
/**
 * Listen for Thread creation events, used for `amplify-help` channel/forum.
 */

client.on(Events.ThreadCreate, async(thread) => {
  console.log('thread created',thread.appliedTags)

  let tagsApplied = undefined

  
  // TODO: If we need to check if a bot created the thread similar to on `MessageCreate`
  const owner = await thread.fetchOwner() 
  if (owner?.user?.bot) return;


  if (thread?.parent?.type === ChannelType.GuildForum) {
      const appliedTagIds = thread.appliedTags
      // get all tags currently applied to the thread
      tagsApplied = thread.parent.availableTags
        .filter((tag) => appliedTagIds.includes(tag.id))
        .map(({ id, name }) => ({ id, name }))

  }

  let record; // TODO: Get correct type

    try {
      record = await prisma.question.create({
        data: {
          ownerId: thread.ownerId as string,
          threadId: thread.id,
          channelName: 'amplify-help', // TODO: Hard coded for now, need to figure out how to get it from the event payload
          title: thread.name,
          createdAt: thread.createdAt as Date,
          url: thread.url,
          guild: {
            connect: {
              id: thread.guild?.id,
            },
          },
          tags: {
            connectOrCreate: tagsApplied?.map(({ id, name }) => ({
              where: { id },
              create: { id, name },
            })),
          }
        },
      })
      console.info(`Created question ${record.id}`)
    } catch (error) {
      console.error('Unable to create Question in db', error)
    }

   // update the participants (we do this after the question is created/updated to ensure the question exists in the database and has a valid ID to create the participation records with)
   if (record) {
    console.log('Updating participants', thread.id)
    const messages = await thread.messages.fetch()
    try {
      await prisma.question.update({
        where: {
          id: record.id,
        },
        data: {
          participation: {
            connectOrCreate: messages.map((message) => ({
              where: {
                questionId_participantId: {
                  questionId: record.id,
                  participantId: message.author.id,
                },
              },
              create: {
                participant: {
                  connectOrCreate: {
                    where: { id: message.author.id },
                    create: {
                      id: message.author.id,
                    },
                  },
                },
              },
            })),
          },
        },
      })
    } catch (cause) {
      throw new Error('Unable to update participants', { cause })
    }
    console.log('Successfully updated participants')
   }
   console.log(`Thread ${thread.id} updated`)
   console.debug('[client:events:ThreaCreate] finished')
})
/**
 * Listen for thread updates. This is important to keep questions in sync -- for example, when a post's tags are updated
 */
client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
  console.debug('[client:events:ThreadUpdate] ThreadUpdate started')
  /**
   * capture updates to threads within help channels (i.e. "questions")
   * - if the thread is new or does not exist in the database, create a new question
   * - update question with tags
   */
  if (isThreadWithinHelpChannel(newThread)) {
    const isSolved = newThread.name.startsWith(PREFIXES.solved)
    const title = newThread.name
      .replace(PREFIXES.solved, '')
      .replace(PREFIXES.open, '')

    // capture tags (only applies to forum channel posts)
    let tagsApplied = undefined
    let tagsRemoved = undefined
    if (newThread?.parent?.type === ChannelType.GuildForum) {
      const appliedTagIds = newThread.appliedTags
      // get all tags currently applied to the thread
      tagsApplied = newThread.parent.availableTags
        .filter((tag) => appliedTagIds.includes(tag.id))
        .map(({ id, name }) => ({ id, name }))
      // get the tags that were removed
      tagsRemoved = oldThread.appliedTags.filter(
        (id) => !appliedTagIds.includes(id)
      )
    }

    let record: Question

    // try updating/creating the question
    try {
      console.log('Updating question', newThread.id)
      record = await prisma.question.upsert({
        where: {
          threadId: oldThread.id,
        },
        update: {
          channelName: newThread.parent!.name,
          threadId: newThread.id,
          title,
          url: newThread.url,
          createdAt: newThread.createdAt as Date,
          isSolved,
          tags: {
            connectOrCreate: tagsApplied?.map(({ id, name }) => ({
              where: { id },
              create: { id, name },
            })),
            disconnect: tagsRemoved?.map((id) => ({ id })),
          },
        },
        // backfill if necessary (this is the same as the update)
        create: {
          channelName: newThread.parent!.name,
          threadId: newThread.id,
          title,
          url: newThread.url,
          createdAt: newThread.createdAt as Date,
          ownerId: (await newThread.fetchStarterMessage())!.author.id,
          guild: {
            connect: {
              id: newThread.guild?.id,
            },
          },
          isSolved,
          tags: {
            connectOrCreate: tagsApplied?.map(({ id, name }) => ({
              where: { id },
              create: { id, name },
            })),
          },
        },
      })
    } catch (cause) {
      throw new Error(`Unable to update thread ${newThread.id} in database`, {
        cause,
      })
    }

    // update the participants (we do this after the question is created/updated to ensure the question exists in the database and has a valid ID to create the participation records with)
    if (record) {
      console.log('Updating participants', newThread.id)
      const messages = await newThread.messages.fetch()
      try {
        await prisma.question.update({
          where: {
            id: record.id,
          },
          data: {
            participation: {
              connectOrCreate: messages.map((message) => ({
                where: {
                  questionId_participantId: {
                    questionId: record.id,
                    participantId: message.author.id,
                  },
                },
                create: {
                  participant: {
                    connectOrCreate: {
                      where: { id: message.author.id },
                      create: {
                        id: message.author.id,
                      },
                    },
                  },
                },
              })),
            },
          },
        })
      } catch (cause) {
        throw new Error('Unable to update participants', { cause })
      }
      console.log('Successfully updated participants')
    }
    console.log(`Thread ${oldThread.id} updated`)
    console.debug('[client:events:ThreadUpdate] finished')
  }
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

process.on('exit', () => {
  console.log('destroying client')
  client?.destroy()
})

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('destroying client')
    client?.destroy()
  })
}
