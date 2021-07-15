export type StandardResponse = {
  tts: boolean
  content: string
  embeds: Embed[]
  allowed_mentions: string[]
}

export type SlashCommandResponse = StandardResponse | string

export type SlashCommandOptions = {
  name: string
  description?: string
  sandbox?: boolean
}

export type DiscordSecrets = {
  DISCORD_APP_ID: string
  DISCORD_BOT_TOKEN: string
  DISCORD_PUBLIC_KEY: string
}
