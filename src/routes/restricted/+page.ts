import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ session }) => {
  return {
    status: session?.user ? 403 : 401,
    props: {},
  }
}
