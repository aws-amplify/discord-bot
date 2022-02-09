import fetch from 'node-fetch'

export async function registerCommand(command, { guildId }) {
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command.config),
  }
  let url = `https://discord.com/api/v8/applications/${process.env.DISCORD_APP_ID}/commands`
  if (guildId) {
    url = `https://discord.com/api/v8/applications/${process.env.DISCORD_APP_ID}/guilds/${guildId}/commands`
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
