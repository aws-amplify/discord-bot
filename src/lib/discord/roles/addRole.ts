// applies a role to a given user
export async function addRole(
  roleId: string | undefined,
  guildId: string | undefined,
  userId: string
) {
  const res = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      method: 'PUT',
    }
  )
  if (!res.ok) {
    console.error(
      `Failed to add role ${roleId} to user ${userId}: ${res.statusText}`
    )
    return false
  } else {
    return true
  }
}