import { derived, writable } from 'svelte/store'
import { page } from '$app/stores'
import type { Writable } from 'svelte/store'
import type { RESTGetAPICurrentUserResult } from 'discord-api-types/v10'

export { store as notifications } from './notifications'

type UserStore = RESTGetAPICurrentUserResult & {
  memberOf: string[]
}

export const session = derived(page, ($page) => {
  return $page?.data?.session ?? null
})
export const guild: Writable<string> = writable(
  import.meta.env.VITE_DISCORD_GUILD_ID
)

export const isSplashScreenActive = writable(false)
