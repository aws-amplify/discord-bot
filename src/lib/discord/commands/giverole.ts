import { SlashCommandBuilder } from '@discordjs/builders'
import type {
  Role,
  User,
  InteractionReplyOptions,
  ChatInputCommandInteraction,
} from 'discord.js'

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string> {
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

  if (caller.user.id === user.id) {
    return `This command does not support adding roles to yourself.`
  }

  if (guild.members.cache.get(user.id).roles.add(role)) {
    return `Successfully added role \`${role.name}\` to ${user.username}#${user.discriminator}.`
  }

  return '🤢 something went wrong'
}

export const config = new SlashCommandBuilder()
  .setName('giverole')
  .setDescription('Give a user a role.')
  .setDefaultMemberPermissions('0') // 0 = disabled by default
  .addRoleOption((option) =>
    option.setName('role').setDescription('The role to give.').setRequired(true)
  )
  .addUserOption((option) =>
    option.setName('user').setDescription('The user to boop').setRequired(true)
  )
