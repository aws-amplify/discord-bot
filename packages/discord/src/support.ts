import type {
  ForumChannel,
  TextChannel,
  ThreadChannel,
  Embed,
} from 'discord.js'

export function generateResponse(content: string, embeds?: Embed[]) {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  }
}

export function isHelpChannel(channel: TextChannel | ForumChannel) {
  return channel.name.startsWith('help-') || channel.name.endsWith('-help')
}

export function isThreadWithinHelpChannel(channel: ThreadChannel) {
  return (
    channel.parent?.name.startsWith('help-') ||
    channel.parent?.name.endsWith('-help')
  )
}
