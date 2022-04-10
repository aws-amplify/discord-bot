import { createCommand, createOption } from '@hey-amplify/discord'
import type { CommandInteraction } from 'discord.js'

const repository = createOption({
  name: 'repository',
  description: 'The AWS Amplify repository',
  required: true,
  type: 3,
  choices: ['cli', 'hosting', 'js', 'docs'],
})

function getRepositoryUrl(repository: string) {
  switch (repository) {
    case 'cli':
      return 'https://github.com/aws-amplify/amplify-cli'
    case 'hosting':
      return 'https://github.com/aws-amplify/amplify-hosting'
    case 'js':
      return 'https://github.com/aws-amplify/amplify-js'
    case 'docs':
      return 'https://github.com/aws-amplify/docs'
    case 'studio':
      return 'https://github.com/aws-amplify/admin-ui'
    default:
      return '🤢 something went wrong, repository not found'
  }
}

export default createCommand({
  name: 'github',
  description: 'Gives link to GitHub repository',
  options: [repository],
  handler: (interaction: CommandInteraction) => {
    const [{ value: repository }] = interaction.options.data
    return getRepositoryUrl(repository as string)
  },
})
