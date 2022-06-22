import { MessageEmbed } from 'discord.js'
import { createCommand, createOption } from './../../discord'
import type { ThreadChannel } from 'discord.js'
import { prisma } from '$lib/db'

export const PREFIXES = {
  solved: '✅ - ',
  open: '﹖ - ',
}

async function handler(interaction) {
  const channel = interaction.channel as ThreadChannel
  const messages = await channel.messages.fetch()
  const record = await prisma.question.findUnique({
    where: { threadId: channel.id },
  })

  if (!channel.isThread()) {
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')
    embed.setDescription(
      'This command only works in public threads within help channels.'
    )
    return { embeds: [embed] }
  }

  const args = interaction.options.data.reduce(
    (acc, current, index, source) => {
      return {
        ...acc,
        [current.name]: current,
      }
    },
    {}
  )

  if (interaction.user.id !== record?.ownerId) {
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')
    embed.setDescription('Only owners of questions can use this command.')
    return { embeds: [embed] }
  }

  function parseTitlePrefix(title) {
    let prefix
    for (const [, value] of Object.entries(PREFIXES)) {
      if (title.startsWith(value)) {
        prefix = value
        break
      }
    }
    return prefix
  }

  function parseTitle(title) {
    return title.replace(parseTitlePrefix(title), '')
  }

  if (args.rename) {
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')

    // check if thread has been renamed within 10 minutes
    const renames = messages.filter(
      (m) => m.author.id === channel.ownerId && m.type === 'CHANNEL_NAME_CHANGE'
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
        return { embeds: [embed] }
      }
    }

    // rename the thread
    const [{ value: title }] = args.rename.options
    const name = `${parseTitlePrefix(channel.name) || ''}${title.slice(0, 140)}`
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
      return { embeds: [embed] }
    }
  }

  if (args.archive) {
    // send a message
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')
    embed.setDescription('This thread has been archived.')
    channel.send({ embeds: [embed] })

    // archive thread
    let reason
    if (args.archive.options.length) {
      reason = args.archive.options[0].value
    }
    await channel.setArchived(true, reason)
    return
  }

  if (args.solved) {
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')

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
      } catch (error) {
        console.error('Unable to update thread isSolved=true in db', error)
      }

      embed.setDescription('Marked as solved.')
      return { embeds: [embed] }
    }
  }

  if (args.reopen) {
    const embed = new MessageEmbed()
    embed.setColor('#ff9900')

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
  }

  return '🤢 something went wrong'
}

const command = createCommand({
  name: 'thread',
  description: 'Thread actions',
  enabledByDefault: true,
  options: [
    createOption({
      name: 'rename',
      description: 'Rename a thread',
      type: 1,
      options: [
        createOption({
          name: 'title',
          description: 'Title to rename',
          type: 3,
          required: true,
        }),
      ],
    }),
    createOption({
      name: 'solved',
      description: 'Mark this thread as solved',
      type: 1,
    }),
    createOption({
      name: 'archive',
      description: 'Archive a thread',
      type: 1,
      options: [
        createOption({
          name: 'reason',
          description: 'Reason for archiving',
          type: 3,
          required: false,
        }),
      ],
    }),
    createOption({
      name: 'reopen',
      description: 'Reopen a thread.',
      type: 1,
    }),
  ],
  handler,
})

export default command

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('/thread')
}
