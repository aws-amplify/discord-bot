import fetch from 'node-fetch'
import { secrets } from './secrets.js'
import { bank } from './commands/_bank.js'

export async function getGuilds() {
  const { DISCORD_TOKEN } = secrets
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
  const { DISCORD_APP_ID, DISCORD_TOKEN } = secrets
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

export async function registerCommand(command, { guildId }) {
  const { DISCORD_APP_ID, DISCORD_TOKEN } = secrets
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command.config),
  }
  let url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/commands`
  if (guildId) {
    url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/guilds/${guildId}/commands`
  }

  let data
  try {
    console.log(`Registering ${command.config.name}`)
    const response = await fetch(url, config)
    if (response.ok && (response.status === 200 || response.status === 201)) {
      console.log(
        `${response.status === 201 ? 'Created' : 'Updated'} ${
          command.config.name
        } successfully`
      )
      data = await response.json()
    } else {
      data.errors = [
        {
          message: `Unable to register ${command.config.name}`,
          status: response.status,
        },
      ]
    }
  } catch (error) {
    throw new Error(
      `Error registering command ${command?.config?.name}:`,
      error
    )
  }

  return data
}

export async function deleteCommand(commandId, { guildId }) {
  const { DISCORD_APP_ID, DISCORD_TOKEN } = secrets
  const config = {
    method: 'DELETE',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }
  let url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/commands/${commandId}`
  if (guildId) {
    url = `https://discord.com/api/v8/applications/${DISCORD_APP_ID}/guilds/${guildId}/commands/${commandId}`
  }

  let data
  try {
    const response = await fetch(url, config)
    if (response.ok && response.status === 200) {
      data = await response.json()
    }
  } catch (error) {
    throw new Error(`Error deleting command ${commandId}:`, error)
  }

  return data
}

export async function syncCommands() {
  const commands = Array.from(bank.values()).map(registerCommand)
  return await Promise.allSettled(commands)
}

export async function getCurrentUser() {
  const { DISCORD_TOKEN } = secrets
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
  const { DISCORD_TOKEN } = secrets
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
