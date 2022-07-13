import { createCommand } from '$discord'
import type { Role, User, InteractionReplyOptions } from 'discord.js'

async function handler(interaction): Promise<InteractionReplyOptions | string> {
  const { member: caller, guild } = interaction
  const { role, user } = interaction.options.data.reduce(
    (acc, current, index, source) => {
      return {
        ...acc,
        [current.name]: current[current.name],
      }
    },
    {}
  ) as { role: Role; user: User }

  if (user.bot) {
    return 'This command does not support adding roles to bots.'
  }

  if (caller.id === user.id) {
    return `This command does not support adding roles to yourself.`
  }

  if (guild.members.cache.get(user.id).roles.add(role)) {
    return `Successfully added role \`${role.name}\` to ${user.username}#${user.discriminator}.`
  }

  return '🤢 something went wrong'
}

const command = createCommand({
  name: 'giverole',
  description: 'Gives role to user',
  enabledByDefault: false, // todo: restrict who can execute
  options: [
    {
      name: 'role',
      description: 'Role to give',
      type: 8,
      required: true,
    },
    {
      name: 'user',
      description: 'User to receive role',
      type: 6,
      required: true,
    },
  ],
  handler,
})

export default command

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('/giverole')
}
