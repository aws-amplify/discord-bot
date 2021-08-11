export function generateResponse(content, embeds) {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  }
}
