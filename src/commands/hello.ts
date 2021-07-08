import type { SlashCommandOptions, SlashCommandResponse } from './_command'

export const config: SlashCommandOptions = {
  name: 'hello',
  description: 'hello world',
}

export async function handler(context?: any): Promise<SlashCommandResponse> {
  return 'world'
}
