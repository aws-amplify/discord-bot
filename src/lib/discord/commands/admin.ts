import { SlashCommandBuilder } from '@discordjs/builders'
import { faker } from '@faker-js/faker'
import { EmbedBuilder } from 'discord.js'
import { getUserAccess } from '$discord/get-user-access'
import { prisma } from '$lib/db'
import {
  postDiscussion,
  postAnswer,
  markAnswered,
  lockDiscussion,
} from '$lib/github/queries'
import { repositoriesWithDiscussions as repositories } from './_repositories'
import { isThreadWithinHelpChannel } from '../support'
import type {
  Message,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  ThreadChannel,
} from 'discord.js'
import type { Question } from '@prisma/client'

const userIdToUsername = new Map<string, User>()

type User = {
  username: string
  avatar: string
  highestRole: string
}

async function getUser(message: Message) {
  const userId = message.author?.id
  const defaultRole = 'at-everyone'
  if (!userIdToUsername.has(userId)) {
    const guildMember = await message.guild?.members.fetch(userId)
    const role = guildMember?.roles?.highest?.name ?? defaultRole
    const color = guildMember?.roles?.highest?.color ?? '91A6A6'
    const roleIcon = `<img src="${import.meta.env.VITE_HOST}/api/p/color/${color}.svg" height="12px" width="12px" align="center" />`
    userIdToUsername.set(`${userId}`, {
      username: `${faker.unique(faker.color.human)} ${faker.unique(
        faker.hacker.noun
      )}`,
      avatar: `https://avatars.dicebear.com/api/bottts/${userId}.svg`,
      highestRole: `(${role} ${roleIcon})`,
    })
  }

  const user = userIdToUsername.get(userId)
  return `<img src=${user?.avatar} width="30"  align="center" /> **${user?.username}** ${user?.highestRole}: `
}

async function createAnswer(answer: Message) {
  const user = await getUser(answer)
  return `${user} ${answer.content}`
}

async function createDiscussionBody(
  messages: Map<string, Message>,
  threadUrl: string
): Promise<string> {
  let body = ''
  for (const [id, message] of messages) {
    const user = await getUser(message)
    body += `${user} ${message.content}\n\n`
    if (message.attachments?.size) {
      message.attachments.forEach((attachment, id) => {
        body += `<img src="${attachment.attachment}" />\n\n`
      })
    }
  }

  body += `#### 🕹️ View the original Discord thread [here](${threadUrl})\n`
  return body
}

export const config = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Commands for admins.')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('mirror')
      .setDescription('Mirror a thread to GitHub Discussions')
      .addStringOption((option) =>
        option
          .setName('repository')
          .setDescription('The AWS Amplify repository')
          .setRequired(true)
          .addChoices(
            ...[...repositories.keys()].map((r) => ({ name: r, value: r }))
          )
      )
  )

async function addDiscussion(discussion, userId: string, record: Question) {
  const githubDiscussion = {
    id: discussion?.createDiscussion?.discussion?.id,
    url: discussion?.createDiscussion?.discussion?.url,
    createdBy: userId,
    Question: {
      connect: {
        id: record.id,
      },
    },
  }
  try {
    await prisma.gitHubDiscussion.create({
      data: githubDiscussion,
    })
  } catch (error) {
    console.error(`Failed to add discussion to db ${error.message}`)
  }
}

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string> {
  await interaction.deferReply()

  const channel = interaction.channel as ThreadChannel
  const record = await prisma.question.findUnique({
    where: { threadId: channel.id },
  })

  const messagesCollection = await channel?.messages?.fetch()
  let messagesArr = Array.from(messagesCollection.values())
  const firstMessage = await channel.fetchStarterMessage()
  messagesArr.push(firstMessage)
  messagesArr = messagesArr
    .reverse()
    .filter((message: Message<boolean>) => !message.author.bot)
  const messages = new Map(
    messagesArr.map((message) => {
      return [message.id, message]
    })
  )

  const somethingWentWrongResponse = (message?: string) => {
    return `🤢 something went wrong${message}`
  }

  const badAccessMessage = (text: string) => {
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    embed.setDescription(text)
    return { embeds: [embed], ephemeral: true }
  }

  if (!channel.isThread() || !isThreadWithinHelpChannel(channel))
    return badAccessMessage(
      'This command only works in public threads within help channels.'
    )

  // check if user is admin
  let access
  if (interaction?.user?.id) {
    try {
      access = await getUserAccess(interaction.user.id)
    } catch (error) {
      console.error('Error getting access', error)
      return somethingWentWrongResponse(': failed to check user admin status')
    }
  }
  if (!access?.isAdmin)
    return badAccessMessage('Only admins can use this command.')
  if (!record || !messages?.size)
    return somethingWentWrongResponse(': failed to fetch thread messages.')

  // create discussion content
  const title = record?.title
  const body = await createDiscussionBody(messages, record?.url)
  let answerContent

  // if the answer is solved create solution content
  if (record.isSolved) {
    const answerRecord = await prisma.answer.findUnique({
      where: { questionId: record?.id },
    })
    const answerMessage =
      messagesArr[
        messagesArr.findIndex(
          (message: Message) => message.id === answerRecord?.id
        )
      ]
    if (answerMessage) {
      answerContent = await createAnswer(answerMessage)
    }
  }
  const repo = repositories.get(
    interaction.options.getString('repository') as string
  )

  if (repo?.discussion) {
    try {
      const postResponse = await postDiscussion({
        repoId: repo.id,
        categoryId: repo.discussion.id,
        title,
        body,
        mutationId: record.id,
      })
      if (postResponse)
        addDiscussion(postResponse, interaction?.user?.id, record)
      if (answerContent) {
        try {
          const answerResponse = await postAnswer({
            discussionId: postResponse?.createDiscussion?.discussion?.id,
            body: answerContent,
            clientMutationId: record.id,
          })
          await markAnswered({
            commentId: answerResponse?.addDiscussionComment?.comment?.id,
            clientMutationId: record.id,
          })
        } catch (error) {
          console.error(error.message)
        }
      }
      await lockDiscussion({
        discussionId: postResponse?.createDiscussion?.discussion?.id,
        clientMutationId: record.id,
      })
      if (postResponse?.createDiscussion?.discussion?.url) {
        return `📦 ${postResponse?.createDiscussion?.discussion?.url}`
      }
    } catch (error) {
      return somethingWentWrongResponse(': failed to post discussion')
    }
  }
  return somethingWentWrongResponse(': GitHub discussion not found')
}
