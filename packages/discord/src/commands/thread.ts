import { SlashCommandBuilder } from '@discordjs/builders'
import { EmbedBuilder, MessageType } from 'discord.js'
import { prisma } from '../prisma.js'
import { isThreadWithinHelpChannel } from '../support.js'
import { isAdminOrStaff } from '../is-admin-or-staff.js'
import type {
  ChatInputCommandInteraction,
  GuildMember,
  ThreadChannel,
  InteractionReplyOptions,
} from 'discord.js'

export const PREFIXES = {
  solved: '✅ - ',
  open: '﹖ - ',
}

export function parseTitlePrefix(title: string): string | undefined {
  let prefix
  for (const [, value] of Object.entries(PREFIXES)) {
    if (title.startsWith(value)) {
      prefix = value
      break
    }
  }
  return prefix
}

export function parseTitle(title: string) {
  return title.replace(parseTitlePrefix(title) as string, '')
}

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string> {
  const channel = interaction.channel as ThreadChannel
  const messages = await channel.messages.fetch()
  const record = await prisma.question.findUnique({
    where: { threadId: channel.id },
  })
  const subcommand = interaction.options.getSubcommand()

  /**
   * Create embed for reply
   */
  const embed = new EmbedBuilder()
  embed.setColor('#ff9900')

  if (!channel.isThread() || !isThreadWithinHelpChannel(channel)) {
    embed.setDescription(
      'This command only works in public threads within help channels.'
    )
    return { embeds: [embed], ephemeral: true }
  }

  /**
   * Only allow answer selections if user is:
   * - admin or staff
   * - author of question
   */
  if (
    interaction.user.id !== record?.ownerId &&
    !(await isAdminOrStaff(interaction.member as GuildMember))
  ) {
    embed.setDescription('Only owners of questions can use this command.')
    return { embeds: [embed], ephemeral: true }
  }

  switch (subcommand) {
    case 'rename': {
      // check if thread has been renamed within 10 minutes
      const renames = messages.filter(
        (m) =>
          m.author.id === channel.ownerId &&
          m.type === MessageType.ChannelNameChange
      )
      const lastRenameTimestamp = renames.first()?.createdTimestamp
      if (lastRenameTimestamp) {
        const minutesSinceLastRename = Math.floor(
          (Date.now() - lastRenameTimestamp) / 1000 / 60
        )
        if (minutesSinceLastRename < 10) {
          embed.setDescription(
            `You can only rename a thread once every 10 minutes.`
          )
          return { embeds: [embed], ephemeral: true }
        }
      }
      const title = interaction.options.getString('title', true)
      const name = `${parseTitlePrefix(channel.name) || ''}${title.slice(
        0,
        90
      )}`
      if (await channel.setName(name)) {
        try {
          await prisma.question.update({
            where: { threadId: channel.id },
            data: { title },
          })
        } catch (error) {
          console.error('Unable to update thread name in db', error)
        }

        embed.setDescription(`This thread has been renamed.`)
        return { embeds: [embed], ephemeral: true }
      }
      break
    }
    case 'solved': {
      // is the channel already marked as solved?
      const prefix = parseTitlePrefix(channel.name)
      if (prefix === PREFIXES.solved) {
        embed.setDescription('Thread is already marked as solved.')
        return { embeds: [embed] }
      }

      // mark the thread as solved
      const title = parseTitle(channel.name)
      if (await channel.setName(`${PREFIXES.solved}${title}`)) {
        try {
          await prisma.question.update({
            where: { threadId: channel.id },
            data: { isSolved: true },
          })
          embed.setDescription('Marked as solved.')
        } catch (error) {
          console.error('Unable to update thread isSolved=true in db', error)
          embed.setDescription(
            'Something went wrong updating the question on our end.'
          )
        }

        return { embeds: [embed] }
      }
      break
    }
    case 'reopen': {
      // is the channel already marked as solved?
      const prefix = parseTitlePrefix(channel.name)
      if (prefix === PREFIXES.open) {
        embed.setDescription(
          'Thread has not yet been marked as solved, skipping..'
        )
        return { embeds: [embed] }
      }

      // mark the thread as solved
      const title = parseTitle(channel.name)
      if (await channel.setName(`${PREFIXES.open}${title}`)) {
        try {
          await prisma.question.update({
            where: { threadId: channel.id },
            data: { isSolved: false },
          })
        } catch (error) {
          console.error('Unable to update thread isSolved=false in db', error)
        }

        embed.setDescription('Thread has been re-opened.')
        return { embeds: [embed] }
      }
      break
    }
    default:
      break
  }

  return '🤢 something went wrong'
}

export const config = new SlashCommandBuilder()
  .setName('thread')
  .setDescription('Thread actions')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('rename')
      .setDescription('Rename a thread')
      .addStringOption((option) =>
        option
          .setName('title')
          .setDescription('Title to rename')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('solved').setDescription('Mark this thread as solved')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('reopen').setDescription('Reopen this thread')
  )
