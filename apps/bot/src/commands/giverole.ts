import { createCommand, discord } from '@hey-amplify/discord'
// import { GuildMemberRoleManager } from 'discord.js'
import type { CommandInteraction } from 'discord.js'

async function handler(interaction: CommandInteraction) {
  const { message, options, user: caller } = interaction
  // const { user } = Object.entries(options.data.member)
  // const { role, roleId } = Object.entries(options.data.role)

  // if (caller.id === user.id) {
  //   return `This command does not support adding roles to yourself.`
  // }
  // console.log({ userId, roleId, guild_id, addRoleToUser })
  // if (await discord.addRoleToUser({ guildId: guild_id, userId, roleId })) {
  //   return `Successfully added role \`${role.name}\` to user.`
  // }
  return '🤢 something went wrong'
}

export default createCommand({
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
