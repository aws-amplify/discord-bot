import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals }) => {
  return {
    isLoggedIn: !!locals.session?.user,
  }
}
