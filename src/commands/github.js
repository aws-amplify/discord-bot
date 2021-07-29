export const config = {
  name: 'github',
  description: 'AIO GitHub command palette',
  default_permission: true, // todo: constrain who can execute
  options: [
    {
      name: 'repository',
      description: 'The AWS Amplify repository',
      type: 3,
      required: false,
      choices: [
        {
          name: 'cli',
          value: 'amplify-cli',
          return: 'https://github.com/aws-amplify/amplify-cli',
        },
        {
          name: 'js',
          value: 'amplify-js',
          return: 'https://github.com/aws-amplify/amplify-js',
        },
        {
          name: 'js',
          value: 'amplify-adminui',
          return: 'https://github.com/aws-amplify/amplify-adminui',
        },
      ],
    },
  ],
}

export async function handler({ data, guild_id, member }) {
  console.log(data, data.resolved)
  const [[userId, user]] = Object.entries(data.resolved.members)
  const [[roleId, role]] = Object.entries(data.resolved.roles)

  // if (userId === member.user.id) {
  //   return `This command does not support adding roles to yourself.`
  // }
  // if (await addRoleToUser({ guildId: guild_id, userId, roleId })) {
  //   return `Successfully added role \`${role.name}\` to user.`
  // }
  return '🤢 something went wrong'
}
