import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { session } = await parent()
  return {
    status: session?.user ? 403 : 401,
    props: {},
  }
}
