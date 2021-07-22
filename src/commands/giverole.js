import { addRoleToUser } from '../discord.js'

export const config = {
  name: 'giverole',
  description: 'Gives role to user',
  default_permission: true, // todo: constrain who can execute
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
}

export async function handler({ data, guild_id }) {
  const [[userId, user]] = Object.entries(data.resolved.members)
  const [[roleId, role]] = Object.entries(data.resolved.roles)
  if (await addRoleToUser({ guildId: guild_id, userId, roleId })) {
    return `Successfully added ${role.name} to user`
  }
  return '🤢 something went wrong'
}
