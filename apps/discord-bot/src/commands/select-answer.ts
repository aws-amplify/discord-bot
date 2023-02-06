import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandType, EmbedBuilder } from 'discord.js'
import { prisma } from '$lib/db'
import { isAdminOrStaff } from '../is-admin-or-staff'
import type {
  GuildMember,
  MessageContextMenuCommandInteraction,
} from 'discord.js'
import { parseTitle, parseTitlePrefix, PREFIXES } from './thread'

export const config = new ContextMenuCommandBuilder()
  .setName('select-answer')
  .setType(ApplicationCommandType.Message)

export const handler = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  const channel = interaction.channel
  const answer = interaction.targetId
  const record = await prisma.question.findUnique({
    where: { threadId: interaction.channelId },
    select: {
      id: true,
      ownerId: true,
      answer: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!channel?.isThread()) {
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
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
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    embed.setDescription('Only owners of questions can use this command.')
    return { embeds: [embed], ephemeral: true }
  }

  /**
   * Deny answer selection when answer is authored by a bot
   */
  if (interaction.targetMessage.author.bot) {
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    embed.setDescription('You cannot select an answer from a bot.')
    return { embeds: [embed], ephemeral: true }
  }

  /**
   * Deny reselecting same answer
   */
  if (record?.answer?.id === answer) {
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    embed.setDescription('You have already selected this answer.')
    return { embeds: [embed], ephemeral: true }
  }

  if (record?.answer?.id) {
    // delete previous answer
    await prisma.answer.delete({
      where: { id: record.answer.id },
    })
  }

  // update question with new answer
  await prisma.question.update({
    where: { id: record!.id },
    data: {
      answer: {
        create: {
          id: answer,
          content: interaction.targetMessage.content,
          owner: {
            connect: {
              id: interaction.targetMessage.author.id,
            },
          },
          createdAt: interaction.targetMessage.createdAt,
          selectedBy: interaction.user.id,
          url: interaction.targetMessage.url,
          participation: {
            connect: {
              questionId_participantId: {
                participantId: interaction.targetMessage.author.id,
                questionId: record!.id,
              },
            },
          },
        },
      },
    },
  })

  // prepare to mark the response as solved
  const embed = new EmbedBuilder()
  embed.setColor('#ff9900')

  // is the channel already marked as solved?
  const prefix = parseTitlePrefix(channel.name)
  if (prefix !== PREFIXES.solved) {
    const title = parseTitle(channel.name)
    await channel.setName(`${PREFIXES.solved}${title}`)
  }

  let updated = false
  try {
    await prisma.question.update({
      where: { threadId: channel.id },
      data: { isSolved: true },
    })
    updated = true
  } catch (error) {
    console.error('Unable to update thread isSolved=true in db', error)
    embed.setDescription(
      'Something went wrong updating the question on our end.'
    )
  }

  if (updated) {
    embed.setDescription(
      [
        `Answer selected!`,
        `\`\`\`${interaction.targetMessage.content}\`\`\``,
        `Kudos to ${interaction.targetMessage.author}!`,
        `${interaction.targetMessage.url}`,
      ].join('\n')
    )
    console.info(
      `User ${interaction.user.id} selected answer ${answer} to question ${
        record!.id
      }`
    )
  }

  return { embeds: [embed] }
}
