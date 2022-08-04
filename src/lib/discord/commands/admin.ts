import { SlashCommandBuilder } from '@discordjs/builders'
import { faker } from '@faker-js/faker'
import { EmbedBuilder } from 'discord.js'
import { Routes } from 'discord-api-types/v10'
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
  Guild,
  GuildMember,
  Message,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  ThreadChannel,
} from 'discord.js'

// if question was marked as answered, add additional comment and add answered label
// lock discussion

const userIdToUsername = new Map<string, user>()

type user = {
  username: string
  avatar: string
}

// https://fakerjs.dev/api/unique.html ?
// not sure how long this is stored.. maybe instead just generate
// username while value is already in map?
function getUser(userId: string) {
  if (!userIdToUsername.get(userId)) {
    userIdToUsername.set(`${userId}`, {
      username: faker.unique(faker.hacker.adjective),
      avatar: `https://avatars.dicebear.com/api/bottts/${userId}.svg`,
    })
  }
  return `<img src=${
    userIdToUsername.get(userId)?.avatar
  } width="30" style="vertical-align:bottom; display:inline" /> **${
    userIdToUsername.get(userId)?.username
  }**: <br />`
}

// for some reason this also doesn't return the highest role
async function getHighestRole(
  userId: string,
  guildId: string
): Promise<string> {
  try {
    const res: GuildMember = (await api.get(
      Routes.guildMember(guildId, userId)
    )) as GuildMember
    if (res?.roles?.highest) return ` (${res.roles.highest.name})`
  } catch (error) {
    console.error(`Error fetching user ${userId} roles: ${error.message}`)
  }
  return ''
}

function createAnswer(record) {
  const user = getUser(record.ownerId)
  return `${user} ${record.content}`
}

function createDiscussionBody(record, messages: Map<string, Message>): string {
  let user = getUser(record.ownerId)
  /** @TODO include record content in db so if it gets renamed we still have access to original message */
  let body = `${user} ${record.title}<br /><br />`
  //console.log(messages.values())
  Array.from(messages.values())
    .reverse()
    .filter((message: Message<boolean>) => !message.author.bot)
    .forEach(async (message: Message<boolean>) => {
      user = getUser(message.author.id)
      //   console.log(message.member)
      // const username = getUsername(message.author.id)
      //   console.log("username")
      //   console.log(username)
      //   const role = await getHighestRole(record.ownerId, guildId)
      //   console.log("role")
      //   console.log(role)
      //   console.log("message.content")
      //   console.log(message)
      body += `${user} ${message.content}<br /><br />`
      //   console.log("body")
      //   console.log(body)
    })
  body += `View the original thread: ${record.url}`
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

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string> {
  const channel = interaction.channel as ThreadChannel
  const messages = await channel?.messages?.fetch()
  const record = await prisma.question.findUnique({
    where: { threadId: channel.id },
  })

  // ** for some reason this only returns josef's user
  // and the highest role is null

  //   console.log(channel.guildId)
  //   const guildMembers: GuildMember[] = (await api.get(
  //     Routes.guildMembers(channel.guildId)
  //   )) as GuildMember[]
  //   console.log(guildMembers[0].roles.highest)

  const somethingWentWrongResponse = (message?: string) => {
    return `🤢 something went wrong${message}`
  }

  const accessMessage = (text: string) => {
    const embed = new EmbedBuilder()
    embed.setColor('#ff9900')
    embed.setDescription(text)
    return { embeds: [embed], ephemeral: true }
  }

  if (!channel.isThread() || !isThreadWithinHelpChannel(channel))
    return accessMessage(
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
    return accessMessage('Only admins can use this command.')
  if (!record || !messages?.size)
    return somethingWentWrongResponse(': failed to fetch messages.')

  const title = record?.title
  const body = createDiscussionBody(record, messages)
  let answerMessage
  if (record.isSolved) {
    const answer = await prisma.answer.findUnique({
      where: { questionId: record?.id },
    })
    answerMessage = createAnswer(answer)
  }
  const repo = repositories.get(
    interaction.options.getString('repository') as string
  )

  if (repo?.discussion) {
    try {
      const postResponse = await postDiscussion(
        repo.id,
        repo.discussion.id,
        title,
        body,
        record.id
      )
      if (answerMessage) {
        try {
          const commentResponse = await postAnswer(
            postResponse?.createDiscussion?.discussion?.id,
            answerMessage,
            record.id
          )
          try {
            const markedAnswered = await markAnswered(
              commentResponse?.addDiscussionComment?.comment?.id,
              record.id
            )
            try {
              const locked = await lockDiscussion(
                postResponse?.createDiscussion?.discussion?.id,
                record.id
              )
            } catch (error) {
              return somethingWentWrongResponse(': failed to lock discussion')
            }
          } catch (error) {
            return somethingWentWrongResponse(
              ': failed to mark solution as answered'
            )
          }
        } catch (error) {
          return somethingWentWrongResponse(': failed to post answer comment')
        }
      }
      if (postResponse?.createDiscussion?.discussion?.url) {
        return `📦 ${postResponse.createDiscussion.discussion.url}`
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
