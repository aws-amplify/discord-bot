import type { Handle } from '@sveltejs/kit'

/**
 * Hook to set session on event.locals
 */
export const handleSetSessionLocals: Handle = async ({ event, resolve }) => {
  const session = await event.locals.auth()
  if (session) {
    event.locals.session = session
  }
  return resolve(event)
}
