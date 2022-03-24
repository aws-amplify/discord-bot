import { createDiscordCommand } from '../Command.js'

export default createDiscordCommand({
  name: 'hello',
  description: 'Say hello',
  handler: ({ context }) => {
    return 'world'
  },
})
