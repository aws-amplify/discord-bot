import { SlashCommandBuilder } from '@discordjs/builders'
import { faker } from '@faker-js/faker'
import { EmbedBuilder } from 'discord.js'
import { api } from '$discord'
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
  Attachment,
  GuildMember,
  Message,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  ThreadChannel,
} from 'discord.js'
import { stringify } from 'querystring'

const userIdToUsername = new Map<string, user>()

// const iconMap = new Map<string, string>([
//   ['Admin', 'FD0061'],
//   ['Bot', '7A2F8F'],
//   ['Amplify Bot Dev', '969C9F'],
//   ['Moderator', '0099E1'],
//   ['Amplify Staff', 'CC7900'],
//   ['AWS Staff', 'F93A2F'],
//   ['Community Builder', '00D166'],
//   ['Contributor', '00C09A'],
//   ['Meetup Organizer', 'F8C300'],
//   ['Amplify Guru', '4E6F7B'],
//   ['at-everyone', '91A6A6'],
// ])
const iconMap = new Map<string, string>([
  [
    'Admin',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Admin.svg',
  ],
  ['Bot', 'https://raw.githubusercontent.com/esauerbo1/Images/main/Bot.svg'],
  [
    'Amplify Bot Dev',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Amplify-Bot-Dev.svg',
  ],
  [
    'Moderator',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Moderator.svg',
  ],
  [
    'Amplify Staff',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Amplify-Staff.svg',
  ],
  [
    'AWS Staff',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/AWS-Staff.svg',
  ],
  [
    'Community Builder',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Community-Builder.svg',
  ],
  [
    'Contributor',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Contributor.svg',
  ],
  [
    'Meetup Organizer',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Meetup-Organizer.svg',
  ],
  [
    'Amplify Guru',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/Amplify-Guru.svg',
  ],
  [
    'at-everyone',
    'https://raw.githubusercontent.com/esauerbo1/Images/main/%40everyone.svg',
  ],
])

type user = {
  username: string
  avatar: string
  highestRole: string
}

function getUser(userId: string, guildMember: GuildMember | null) {
  if (!userIdToUsername.get(userId)) {
    let role = 'at-everyone'
    if (guildMember?.roles?.highest?.name) role = guildMember.roles.highest.name
    // const roleIcon = `<img src="${import.meta.env.VITE_HOST}/api/p/color/f3f.svg" height="20" width="20" />`
    const roleIcon = `<img src="${iconMap.get(
      role
    )}" height="20" width="20" style="display:inline-block;" />`
    userIdToUsername.set(`${userId}`, {
      username: `${faker.unique(faker.color.human)} ${faker.unique(
        faker.hacker.noun
      )}`,
      avatar: `https://avatars.dicebear.com/api/bottts/${userId}.svg`,
      highestRole: `(${role} ${roleIcon})`,
    })
  }

  const user = userIdToUsername.get(userId)
  return `<img src=${user?.avatar} width="30" style="vertical-align:bottom;display:inline" /> **${user?.username}** ${user?.highestRole}: `
}

function createAnswer(answer: Message) {
  const user = getUser(answer.author.id, answer.member)
  return `${user} ${answer.content}`
}

function createDiscussionBody(
  firstMessage: Message,
  messages: Map<string, Message>,
  threadUrl: string
): string {
  let user = getUser(firstMessage.author.id, firstMessage.member)
  let body = `${user} ${firstMessage.content}\n\n`
  Array.from(messages.values())
    .reverse()
    .filter((message: Message<boolean>) => !message.author.bot)
    .forEach(async (message: Message<boolean>) => {
      console.log(message)
      user = getUser(message.author.id, message.member)
      body += `${user} ${message.content}\n\n`
      if (message.attachments.size) {
        message.attachments.forEach((attachment, id) => {
          body += `<img src="${attachment.attachment}" />\n\n`
        })
      }
    })
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

async function addDiscussion(discussion, userId: string, record) {
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
  const messages = await channel?.messages?.fetch()
  const record = await prisma.question.findUnique({
    where: { threadId: channel.id },
  })
  const firstMessage = await channel.fetchStarterMessage()

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
  const body = createDiscussionBody(firstMessage, messages, record?.url)
  let answerContent

  //   try {
  //     console.log( `${process.env.VITE_HOST}/api/p/color/${iconMap.get('Admin')}.svg`)
  //     const img = await fetch(
  //       `${process.env.VITE_HOST}/api/p/color/f3f.svg`
  //     )
  //     console.log(img)
  //   } catch (error) {
  //     console.error(error)
  //    // console.error(`failed to fetch image ${error.message}`)
  //   }

  // if the answer is solved create solution content
  if (record.isSolved) {
    const answerRecord = await prisma.answer.findUnique({
      where: { questionId: record?.id },
    })
    const messageArray = Array.from(messages.values())
    const answerMessage =
      messageArray[
        messageArray.findIndex(
          (message: Message) => message.id === answerRecord.id
        )
      ]
    if (answerMessage) answerContent = createAnswer(answerMessage)
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

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('/github')
}
