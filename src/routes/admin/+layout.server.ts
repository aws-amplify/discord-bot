import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  if (locals.session?.user?.isAdmin || locals.session?.user?.isGuildOwner) {
    return {}
  }
  throw redirect(302, '/restricted')
}
