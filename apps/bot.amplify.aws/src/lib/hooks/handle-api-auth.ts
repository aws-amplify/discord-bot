import type { Handle } from '@sveltejs/kit'

function isApiRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api')
}

function isApiAdminRoute(pathname: URL['pathname']) {
  return pathname.startsWith('/api/admin')
}

function isPublicApiRoute(pathname: URL['pathname']) {
  const publicRoutes = ['/api/auth', '/api/p', '/api/webhooks']
  return publicRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Handle and protect API routes
 */
export const handleApiAuth: Handle = async ({ event, resolve }) => {
  // protect API routes
  if (isApiRoute(event.url.pathname)) {
    if (!isPublicApiRoute(event.url.pathname)) {
      if (!event.locals.session?.user) {
        return new Response('Unauthorized', { status: 401 })
      }
      if (
        isApiAdminRoute(event.url.pathname) &&
        !event.locals.session.user.isAdmin
      ) {
        return new Response('Forbidden', { status: 403 })
      }
    }
  }

  return resolve(event)
}
