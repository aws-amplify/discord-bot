import { api } from '$lib/discord/api'
import { Routes } from 'discord-api-types/v10'

/** removes a role from a given user  */
export async function removeRole(
  roleId: string,
  guildId: string,
  userId: string
) {
  try {
    await api.delete(Routes.guildMemberRole(guildId, userId, roleId))
    console.log(`Successfully removed role ${roleId} from user ${userId}`)
    return true
  } catch (err) {
    console.error(`Failed to remove role ${roleId} from user ${userId}: ${err}`)
  }
  return false
}
