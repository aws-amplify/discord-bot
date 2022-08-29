import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ session }) => {
  return {
    isLoggedIn: !!session?.user,
  }
}
