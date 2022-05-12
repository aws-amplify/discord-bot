import { createCommand, createOption } from '@hey-amplify/discord'
import type { ThreadChannel } from 'discord.js'

// TODO: 'archive', 'reopen'
const rename = createOption({
  name: 'rename',
  description: 'Rename a thread',
  type: 1,
  options: [
    createOption({
      name: 'title',
      description: 'Title to rename',
      type: 3,
    }),
  ],
})

const solved = createOption({
  name: 'solved',
  description: 'Mark this thread as solved',
  type: 1,
})

const options = [rename, solved]

export const PREFIXES = {
  solved: '✅ - ',
  open: '﹖ - ',
}

async function handler(interaction) {
  if (interaction.channel.type !== 'GUILD_PUBLIC_THREAD') {
    return 'This command only works in public threads.'
  }
  const channel = interaction.channel as ThreadChannel

  const args = interaction.options.data.reduce(
    (acc, current, index, source) => {
      return {
        ...acc,
        [current.name]: current,
      }
    },
    {}
  )

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
    const [{ value: title }] = args.rename.options
    if (
      await channel.setName(
        `${parseTitlePrefix(channel.name) || ''}${title.slice(0, 140)}`
      )
    ) {
      return `Changed title`
    }
  }

  if (args.solved) {
    const title = parseTitle(channel.name)
    if (await channel.setName(`${PREFIXES.solved}${title}`)) {
      return 'Marked as solved'
    }
  }

  return '🤢 something went wrong'
}

export default createCommand({
  name: 'thread',
  description: 'Thread actions',
  enabledByDefault: true,
  options,
  handler,
})
