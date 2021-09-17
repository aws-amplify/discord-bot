import fetch from 'node-fetch'
const { DISCORD_TOKEN, DISCORD_APP_ID } = process.env

export async function getGuilds() {
  const config = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  const url = `https://discord.com/api/v6/users/@me/guilds`

  let data
  try {
    const response = await fetch(url, config)
    if (response.ok && response.status === 200) {
      data = await response.json()
    }
  } catch (error) {
    throw new Error('Error fetching guilds', error)
  }

  return data
}

export async function getRegisteredCommands() {
  const config = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  const url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/commands`

  let data
  try {
    const response = await fetch(url, config)
    if (response.ok && response.status === 200) {
      data = await response.json()
    }
  } catch (error) {
    throw new Error('Error fetching registered commands', error)
  }

  return data
}

export async function registerCommand(command) {
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command.config),
  }
  const url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/commands`

  let data
  try {
    console.log(`Registering ${command.config.name}`)
    const response = await fetch(url, config)
    if (response.ok && response.status === 200) {
      console.log(`Registered ${command.config.name} successfully`)
      data = await response.json()
    }
  } catch (error) {
    throw new Error(
      `Error registering command ${command?.config?.name}:`,
      error
    )
  }

  return data
}

export async function syncCommands(commandBank) {
  const commands = Array.from(commandBank.values()).map(registerCommand)
  return Promise.allSettled(commands)
}

export async function getCurrentUser() {
  const config = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  const url = `https://discord.com/api/v6/users/@me`

  let data
  try {
    const response = await fetch(url, config)
    if (response.ok && response.status === 200) {
      data = await response.json()
    }
  } catch (error) {
    throw new Error('Error fetching guilds', error)
  }

  if (!data) return
  return `${data.name}#${data.discriminator}`
}

export async function addRoleToUser({ guildId, userId, roleId }) {
  const config = {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
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
