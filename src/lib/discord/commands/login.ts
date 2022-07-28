import { createCommand } from '$discord'
import type { InteractionReplyOptions } from 'discord.js'

async function handler(interaction): Promise<InteractionReplyOptions | string>  {
  const { user } = interaction

  if (user.bot) {
    return 'This command does not support bots logging in.'
  }

  return {
    content: `${import.meta.env.VITE_HOST}/profile/link`,
    ephemeral: true
  }
}

const command = createCommand({
  name: 'login',
  description: 'Sends github login link to user',
  enabledByDefault: false, // todo: restrict who can execute
  handler,
})

export default command

if (import.meta.vitest) {
  const { test } = import.meta.vitest
  test.todo('/login')
}
