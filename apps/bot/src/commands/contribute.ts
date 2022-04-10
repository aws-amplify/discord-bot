import { createCommand, createOption } from '@hey-amplify/discord'
import type { CommandInteraction } from 'discord.js'

const repository = createOption({
  name: 'Amplify Project',
  description: 'The name of the AWS Amplify project to contribute to.',
  required: true,
  choices: ['android', 'cli', 'docs', 'flutter', 'ios', 'js', 'ui'],
})

function getRepositoryContributeUrl(repository) {
  switch (repository) {
    case 'android':
      return 'https://github.com/aws-amplify/amplify-android/contribute'
    case 'cli':
      return 'https://github.com/aws-amplify/amplify-cli/contribute'
    case 'docs':
      return 'https://github.com/aws-amplify/docs/contribute'
    case 'flutter':
      return 'https://github.com/aws-amplify/amplify-flutter/contribute'
    case 'ios':
      return 'https://github.com/aws-amplify/amplify-ios/contribute'
    case 'js':
      return 'https://github.com/aws-amplify/amplify-js/contribute'
    case 'ui':
      return 'https://github.com/aws-amplify/amplify-ui/contribute'
    default:
      return `🤢 something went wrong loading the contribute URL for the ${repository} repository`
  }
}

export default createCommand({
  name: 'contribute',
  description: 'Learn how to contribute to an Amplify project',
  options: [repository],
  handler: (interaction: CommandInteraction) => {
    const [{ value: repository }] = interaction.options.data
    const lines = [
      'Thanks for your interest in contributing! To learn how to get started visit the contributing guide:',
      getRepositoryContributeUrl(repository),
    ]
    const message = lines.join('\n')
    return message
  },
})
