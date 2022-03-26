import type {
  APIApplicationCommandOption,
  APIApplicationCommand,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10'

export interface IDiscordCommandConfig {
  name: string
  description?: string
  usage?: string
  options?: APIApplicationCommandOption[]
  enabledByDefault?: boolean
}

export interface IDiscordCommandContext {
  [key: string]: any
}

export interface IDiscordCommand extends IDiscordCommandConfig {
  handler: (
    context: IDiscordCommandContext
  ) => Promise<string | undefined> | (string | undefined)
  registration?: APIApplicationCommand
}

export type DiscordCommandContext = IDiscordCommandContext
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
    this.name = props.name
    this.description = props.description
    this.usage = props.usage
    this.options = props.options
    this.handler = props.handler
    this.enabledByDefault = props.enabledByDefault ?? true
  }

  public readonly handler: (
    context: IDiscordCommandContext
  ) => Promise<string | undefined> | (string | undefined)

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

export function createDiscordCommand(props: IDiscordCommand): IDiscordCommand {
  return new DiscordCommand(props)
}

export const createCommand = createDiscordCommand
