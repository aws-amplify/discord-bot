import { redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ parent }) => {
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
