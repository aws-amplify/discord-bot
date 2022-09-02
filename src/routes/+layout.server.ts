import type { LayoutServerLoad } from './$types'

export const getSession = (event): Promise<App.Session> => {
  return event.locals.session
}

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    session: locals.session,
  }
}
