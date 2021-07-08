import { Embed } from 'slash-commands'

export type StandardResponse = {
  tts: boolean
  content: string
  embeds: Embed[]
  allowed_mentions: string[]
}

export type SlashCommandResponse = StandardResponse | string

/**
 * A helper for generating a standard response for Discord.
 * @param {string} content The string content to return.
 * @param {Embed[]} embeds A list of embeds to return.
 */
export function generateResponse(
  content: string,
  embeds: Embed[] = []
): StandardResponse {
  return {
    tts: false,
    content,
    embeds,
    allowed_mentions: [],
  }
}

export type SlashCommandOptions = {
  name: string
  description?: string
  sandbox?: boolean
}

export class SlashCommand {
  public name
  public description
  public sandbox: boolean

  constructor(options: SlashCommandOptions) {
    this.name = options.name
    this.description = options?.description
    this.sandbox = Boolean(options?.sandbox)
  }
}
