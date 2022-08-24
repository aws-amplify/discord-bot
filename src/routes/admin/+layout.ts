import { redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ parent }) => {
  const { user } = await parent()
  if (!user) {
    throw redirect(302, '/restricted')
  }
  return {}
}
