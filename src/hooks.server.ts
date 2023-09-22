import { sequence } from '@sveltejs/kit/hooks'
import { init } from '$lib/db'
import { createBot } from '$lib/discord/client'
import { handleAuth } from '$lib/server/hooks/handle-auth'
import { handleApiAuth } from '$lib/server/hooks/handle-api-auth'
import { handleSavedGuild } from '$lib/server/hooks/handle-saved-guild'
import { handleSetSessionLocals } from '$lib/server/hooks/handle-set-session-locals'

// only load the bot if we're in development (on first request to the server), otherwise the bot will be loaded onto the Node/Express server
if (import.meta.env.MODE === 'development') {
  await init()
  await createBot()
}

export const handle = sequence(
  handleSavedGuild,
  handleAuth,
  handleSetSessionLocals,
  handleApiAuth // protect API routes
)
