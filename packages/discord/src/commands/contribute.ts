import { createCommand } from '../Command.js'
import { createOption } from '../CommandOption.js'

const repository = createOption({
  name: 'Amplify Project',
  description: 'The name of the AWS Amplify project to contribute to.',
  required: true,
  choices: ['cli'],
})

export default createCommand({
  name: 'contribute',
  description: 'Learn how to contribute to an Amplify project',
  options: [repository],
  handler: (context) => {
    const [repository] = context.data.options
    switch (repository) {
      case 'cli': {
        const lines = [
          'Thanks for your interest in contributing!',
          'Contributing guide: https://github.com/aws-amplify/amplify-cli/blob/master/CONTRIBUTING.md',
          'Good first issues: https://github.com/aws-amplify/amplify-cli/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22',
        ]
        const message = lines.join('\n')
        return message
      }
      default:
        return '🤢 something went wrong'
    }
  },
})
