// removes a role from a given user
export async function removeRole(
  roleId: string | undefined,
  guildId: string | undefined,
  userId: string
) {
  console.log(guildId)
  const res = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'DELETE',
    }
  )
  if (!res.ok) {
    console.error(
      `Failed to remove role ${roleId} from user ${userId}: ${res.statusText}`
    )
    return false
  } else {
    console.log(`Successfully removed role ${roleId} from user ${userId}`)
    return true
  }
}
