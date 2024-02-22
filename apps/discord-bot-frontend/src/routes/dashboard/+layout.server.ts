import type { LayoutServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: LayoutServerLoad = async ({ parent }) => {
  const { session } = await parent()
  if (
    session?.user?.isAdmin ||
    session?.user?.isStaff ||
    session?.user?.isGuildOwner
  ) {
    return {}
  }
  throw redirect(302, '/restricted')
}
