import { ApplicationCommandOptionType } from 'discord-api-types/v9'
import type {
  APIApplicationCommandOption,
  APIApplicationCommand,
} from 'discord-api-types/v9'

interface IDiscordCommandOptions {
  name: string
  description?: string
  required?: boolean
  type?: any // TODO: type ApplicationCommandOptionType
  choices?: any[] | undefined
}

export class DiscordCommandOption implements IDiscordCommandOptions {
  public readonly name: string
  public readonly description: string
  public readonly required: boolean = false
  public readonly type: any
  public readonly choices?: any[] | undefined

  constructor(props: IDiscordCommandOptions) {
    this.name = props.name
    this.description = props.description || '[default description]'
    this.required = props.required ?? false
    this.type = props.type ?? ApplicationCommandOptionType.String
    if (Array.isArray(props.choices)) {
      this.choices = props.choices.map((choice) => ({
        name: choice,
        value: choice,
      }))
    }
  }
}

export function createDiscordCommandOption(
  props: IDiscordCommandOptions
): DiscordCommandOption {
  return new DiscordCommandOption(props)
}

export const createOption = createDiscordCommandOption
