import { EmbedBuilder, ButtonStyle } from 'discord.js'
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} from '@discordjs/builders'
import { prisma } from '../prisma.js'
import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  TextBasedChannel,
} from 'discord.js'
import type { Question } from '@hey-amplify/prisma-client'

function epoch(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

function createDiscordTimestamp(date: Date): string {
  return `<t:${epoch(date)}:R>`
}

function createQuestionEmbedFields(questions: Question[]) {
  return questions.map((question) => ({
    name: `${question.isSolved ? '✅' : '﹖'} ${createDiscordTimestamp(
      question.createdAt
    )}`,
    value: `${question.title}\n[View in ${question.channelName}](${question.url})`,
  }))
}

export const config = new SlashCommandBuilder()
  .setName('q')
  .setDescription('Get a digest of the latest unsolved questions')

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string | void> {
  const take = 15
  const questions = await prisma.question.findMany({
    where: {
      isSolved: false,
    },
    skip: 0,
    take,
    orderBy: {
      createdAt: 'desc',
    },
  })
  const embed = new EmbedBuilder()
  if (!questions?.length) {
    embed.setTitle('No questions found')
    embed.setDescription('No questions have been asked in this server yet')
    return
  }
  embed.setTitle('Latest questions')
  embed.addFields(createQuestionEmbedFields(questions))
  embed.setFooter({
    text: `${questions[0].id}/${questions[questions.length - 1].id}`,
  })

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('previous')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('next')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel('View full list')
      .setStyle(ButtonStyle.Link)
      .setURL(`${import.meta.env.VITE_HOST}/questions`)
  )

  const filter = (i) => ['previous', 'next'].includes(i.customId)
  const collector = (
    interaction.channel as TextBasedChannel
  ).createMessageComponentCollector({
    filter,
    idle: 15000,
  })

  collector.on('collect', async (i: ButtonInteraction) => {
    const direction = i.customId === 'previous' ? 'prev' : 'next'
    const isNextDirection = direction === 'next'
    // @ts-expect-error we know this message contains an embed
    const [prev, next] = i.message.embeds[0].footer.text.split('/')
    const questions = await prisma.question.findMany({
      where: {
        isSolved: false,
      },
      cursor: {
        id: isNextDirection ? next : prev,
      },
      skip: 1, // skip the cursor
      take: isNextDirection ? take : take * -1,
      orderBy: {
        createdAt: 'desc',
      },
    })
    if (questions.length) {
      embed.setDescription(null)
      embed.setFields(createQuestionEmbedFields(questions))
      embed.setFooter({
        text: `${questions[0].id}/${questions[questions.length - 1].id}`,
      })
    } else {
      embed.setDescription('End of the road')
    }
    await i.update({ embeds: [embed] })
  })

  collector.on('end', async (collected, reason) => {
    console.log(
      `[command: q] Collector ${reason} - collected ${collected.size} items`
    )
    /**
     * remove buttons from the interaction. Once the collector times out it will not respond to buttons
     * @TODO should we move the button handler to the client?
     */
    const m = await interaction.fetchReply()
    interaction.editReply({
      embeds: m.embeds,
      components: [],
    })
  })

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
    components: [row],
  })
  // or return? 🤔
}
