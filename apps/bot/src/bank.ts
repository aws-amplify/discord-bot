import { DiscordCommandBank } from '@hey-amplify/discord'
import github from './commands/github'
import giverole from './commands/giverole'
import type { DiscordCommand } from '@hey-amplify/discord'

export const commands: DiscordCommand[] = [github, giverole]
export const bank = new DiscordCommandBank(commands)
