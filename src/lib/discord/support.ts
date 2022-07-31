import type { TextChannel, ThreadChannel } from 'discord.js'

export function generateResponse(content, embeds?) {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  }
}

export function isHelpChannel(channel: TextChannel) {
  return channel.name.startsWith('help-') || channel.name.endsWith('-help')
}

export function isThreadWithinHelpChannel(channel: ThreadChannel) {
  return (
    channel.parent?.name.startsWith('help-') ||
    channel.parent?.name.endsWith('-help')
  )
}
