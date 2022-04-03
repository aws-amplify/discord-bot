import { createCommand, createOption } from '@hey-amplify/discord'
import { ApplicationCommandOptionType } from 'discord-api-types/v9'

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
    default:
      return '🤢 something went wrong, repository not found'
  }
}

export default createCommand({
  name: 'github',
  description: 'Gives link to GitHub repository',
  options: [repository],
  // @ts-ignore
  handler: (context) => {
    const [{ value: repository }] = context.data.options
    return getRepositoryUrl(repository)
  },
})
