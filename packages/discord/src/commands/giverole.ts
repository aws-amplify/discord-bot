import { SlashCommandBuilder } from '@discordjs/builders'
import {
  EmbedBuilder,
  type Role,
  type User,
  type InteractionReplyOptions,
  type ChatInputCommandInteraction,
} from 'discord.js'
import * as MESSAGES from './_messages.js'

export async function handler(
  interaction: ChatInputCommandInteraction
): Promise<InteractionReplyOptions | string> {
  const { member: caller, guild } = interaction
  if (!caller || !guild) return MESSAGES.SOMETHING_WENT_WRONG

  const role = interaction.options.getRole('role', true) as Role
  const targetMember = interaction.options.getUser('user', true) as User

  const embed = new EmbedBuilder()
  embed.setTitle('/giverole')
  embed.setDescription(MESSAGES.SOMETHING_WENT_WRONG)
  const result: InteractionReplyOptions = { embeds: [embed], ephemeral: true }

  // reject the command if the role is managed by a bot
  if (role.tags?.botId) {
    embed.setDescription(
      'This command does not support adding bot roles to members'
    )
    return result
  }

  // reject the command if the target member is a bot
  if (targetMember.bot) {
    embed.setDescription('This command does not support adding roles to bots.')
    return result
  }

  // reject the command if the caller is attempting to add roles to themselves
  if (caller.user.id === targetMember.id) {
    embed.setDescription(
      `This command does not support adding roles to yourself.`
    )
    return result
  }

  let added
  try {
    // attempt adding the role to the target member
    added = await guild.members.cache.get(targetMember.id)?.roles.add(role)
  } catch (error) {
    console.error('Error adding role to member', error)
    return result
  }
  if (added) {
    embed.setDescription(
      `Added \`${role.name}\`\nto \`${targetMember.username}#${targetMember.discriminator}\``
    )
    return result
  }

  // catch-all return "something went wrong" response
  return result
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
