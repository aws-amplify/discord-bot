import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ parent }) => {
  const { session } = await parent()
  if (session?.user?.isAdmin || session?.user?.isGuildOwner) {
    return {}
  }
  throw redirect(302, '/restricted')
}
