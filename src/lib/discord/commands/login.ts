import { SlashCommandBuilder } from '@discordjs/builders'
import type {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js'

export const config = new SlashCommandBuilder()
  .setName('login')
  .setDescription('Login to GitHub to link your accounts.')

export function handler(
  interaction: ChatInputCommandInteraction
): InteractionReplyOptions | string {
  const { user } = interaction

  if (user.bot) {
    return 'This command does not support bots logging in.'
  } else
    return {
      content: `${import.meta.env.VITE_HOST}/profile/link`,
      ephemeral: true,
    }
}
