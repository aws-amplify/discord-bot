import { getUserAccess } from '$lib/discord/get-user-access'

/**
 * Returns whether the given Discord user administers the specified configuration.
 * A configuration's id is the Discord guild id, so access is resolved directly
 * from the configuration id.
 */
export async function isConfigurationAdmin(
  discordUserId: string | undefined,
  configurationId: string | undefined
): Promise<boolean> {
  if (!discordUserId || !configurationId) return false
  try {
    const access = await getUserAccess(discordUserId, configurationId)
    return access.isAdmin
  } catch {
    // no access when the membership lookup fails
    return false
  }
}
