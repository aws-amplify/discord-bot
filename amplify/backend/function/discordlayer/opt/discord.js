const fetch = require('node-fetch')
const nacl = require('tweetnacl')

exports.verifyEvent = async function verifyEvent(event) {
  const signature = event.headers['X-Signature-Ed25519'.toLowerCase()]
  const timestamp = event.headers['X-Signature-Timestamp'.toLowerCase()]
  const body = JSON.stringify(event.body)
  if (!signature || !timestamp || !body) return false
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
  )
  return isVerified
}

exports.generateResponse = function generateResponse(content, embeds) {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  }
}

exports.addRoleToUser = async function addRoleToUser({
  guildId,
  userId,
  roleId,
}) {
  const config = {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  const url = `https://discord.com/api/v6/guilds/${guildId}/members/${userId}/roles/${roleId}`

  let data
  try {
    const response = await fetch(url, config)
    if (response.ok && response.status === 204) {
      return true
    }
  } catch (error) {
    throw new Error('Error adding role', error)
  }

  if (!data) return
  return data
}
