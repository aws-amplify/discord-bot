const { addRoleToUser } = require('../discord')

const config = {
  name: 'giverole',
  description: 'Gives role to user',
  default_permission: false, // todo: constrain who can execute
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

async function handler({ data, guild_id, member }) {
  const [[userId, user]] = Object.entries(data.resolved.members)
  const [[roleId, role]] = Object.entries(data.resolved.roles)

  if (userId === member.user.id) {
    return `This command does not support adding roles to yourself.`
  }
  if (await addRoleToUser({ guildId: guild_id, userId, roleId })) {
    return `Successfully added role \`${role.name}\` to user.`
  }
  return '🤢 something went wrong'
}

exports.config = config
exports.handler = handler
