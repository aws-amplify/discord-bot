import { SlashCommandBuilder } from '@discordjs/builders'
import { repositories } from './_repositories'
import type {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
} from 'discord.js'

export const config = new SlashCommandBuilder()
  .setName('contribute')
  .setDescription('Learn how to contribute to the AWS Amplify project.')
  .addStringOption((option) =>
    option
      .setName('repository')
      .setDescription('The AWS Amplify repository')
      .addChoices(
        ...[...repositories.keys()].map((r) => ({ name: r, value: r }))
      )
  )

export function handler(
  interaction: ChatInputCommandInteraction
): InteractionReplyOptions | string {
  const somethingWentWrongResponse =
    '🤢 something went wrong, repository not found'
  const repo = repositories.get(
    interaction.options.getString('repository') as string
  )
  if (!repo) return somethingWentWrongResponse
  else return `${repo}/contribute`
}
