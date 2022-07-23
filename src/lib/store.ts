import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { RESTGetAPICurrentUserResult } from 'discord-api-types/v10'

export { store as notifications } from './notifications'

type UserStore = RESTGetAPICurrentUserResult & {
  memberOf: string[]
}

export const user: Writable<UserStore> = writable()
export const guild = writable(import.meta.env.VITE_DISCORD_GUILD_ID)
