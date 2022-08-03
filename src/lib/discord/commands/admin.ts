import { SlashCommandBuilder } from '@discordjs/builders'
import { repositories  } from './_repositories'
import type { ChatInputCommandInteraction } from 'discord.js'

export const config = new SlashCommandBuilder()
  .setName('github')
  .setDescription('Links the GitHub repository for the specified repository.')
  .addStringOption((option) =>
    option
      .setName('repository')
      .setDescription('The AWS Amplify repository')
      .setRequired(true)
    //   .addChoices(
    //     ...[...repositories.keys()].map((r) => ({ name: r, value: r }))
    //   )
  )

export function handler(interaction: ChatInputCommandInteraction): string {
  const somethingWentWrongResponse =
    '🤢 something went wrong, repository not found'
   console.log(repositories)
  //  console.log('discussions')
  //  console.log(repositoriesWithDiscussions)
//   const repo = repositories.get(
//     interaction.options.getString('repository') as string
//   )

const repo = "hello"

  if (!repo) return somethingWentWrongResponse
  else return `📦 ${repo}`
}

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('/github')
}
