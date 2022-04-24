import type {
  APIApplicationCommandOption,
  APIApplicationCommand,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v9'
import type { CommandInteraction } from 'discord.js'

export interface IDiscordCommandConfig {
  name: string
  description?: string
  usage?: string
  options?: APIApplicationCommandOption[]
  enabledByDefault?: boolean
}

export type DiscordCommandHandler = (
  interaction: CommandInteraction
) => string | Promise<string>

export type CreateDiscordCommandInput = IDiscordCommandConfig & {
  handler: DiscordCommandHandler
}

export interface IDiscordCommand extends IDiscordCommandConfig {
  handler: DiscordCommandHandler
  registration?: APIApplicationCommand
}

export type DiscordCommandConfig = IDiscordCommandConfig

export class DiscordCommand implements IDiscordCommand {
  public readonly name: string
  public readonly description?: string
  public readonly usage?: string
  public readonly options: APIApplicationCommandOption[]
  public readonly enabledByDefault?: boolean
  private readonly version: number = 0
  public registration?: APIApplicationCommand

  constructor(props) {
    const validCommandNameRegex = /^[\w-]{1,32}$/g
    if (!validCommandNameRegex.test(props.name)) {
      throw new Error(`Invalid Command name: ${props.name}`)
    }
    this.name = props.name
    this.description = props.description
    this.usage = props.usage
    this.options = props.options
    this.handler = props.handler
    this.enabledByDefault = props.enabledByDefault ?? true
  }

  public readonly handler: DiscordCommandHandler

  public createRegistrationPayload(): RESTPostAPIApplicationCommandsJSONBody {
    const name = this.name
    const description = this.description || ''
    const options = this.options
    const default_permission = this.enabledByDefault
    return {
      name,
      description,
      options,
      default_permission,
    }
  }
}

export function createDiscordCommand(
  props: CreateDiscordCommandInput
): DiscordCommand {
  return new DiscordCommand(props)
}

export const createCommand = createDiscordCommand
