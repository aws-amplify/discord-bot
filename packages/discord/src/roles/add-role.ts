import { Routes } from 'discord-api-types/v10'
import { api } from '../api.js'

/** applies a role to a given user */
export async function addRole(roleId: string, guildId: string, userId: string) {
  try {
    await api.put(Routes.guildMemberRole(guildId, userId, roleId))
    console.log(`Successfully added role ${roleId} to user ${userId}`)
    return true
  } catch (err) {
    console.error(`Failed to add role ${roleId} to user ${userId}: ${err}`)
  }
  return false
}
