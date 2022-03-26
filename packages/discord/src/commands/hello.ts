import { createCommand } from '../Command.js'
import { createOption } from '../CommandOption.js'

const name = createOption({
  name: 'name',
  description: 'The name of the user to greet.',
  required: true,
  choices: ['world', 'everyone'],
})

export default createCommand({
  name: 'hello',
  description: 'Say hello',
  options: [name],
  handler: ({ context }) => {
    return 'world'
  },
})
