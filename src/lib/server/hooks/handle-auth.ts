import { SvelteKitAuth } from '@auth/sveltekit'
import { config } from '$lib/auth/config'
import type { Handle } from '@sveltejs/kit'

/**
 * @todo use session callback to extend session?
 * @todo port in changes to apply roles in discord based on GitHub org membership (if integration is enabled)
 */
export const handleAuth = SvelteKitAuth(config) satisfies Handle
