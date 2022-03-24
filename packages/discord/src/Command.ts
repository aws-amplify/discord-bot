export interface IDiscordCommandConfig {
  name: string
  description?: string
  usage?: string
  // options?: IDiscordCommandOption[]
}

export interface IDiscordCommandContext {
  [key: string]: any
}

export interface IDiscordCommand extends IDiscordCommandConfig {
  handler: (
    context: IDiscordCommandContext
  ) => Promise<string | undefined> | (string | undefined)
}

export type DiscordCommandContext = IDiscordCommandContext
export type DiscordCommandConfig = IDiscordCommandConfig

export class DiscordCommand implements IDiscordCommand {
  public readonly name: string
  public readonly description?: string
  public readonly usage?: string
  public readonly handler: (
    context: IDiscordCommandContext
  ) => Promise<string | undefined> | (string | undefined)

  constructor(props) {
    this.name = props.name
    this.description = props.description
    this.usage = props.usage
    this.handler = props.handler
  }
}

export function createDiscordCommand(props: IDiscordCommand): IDiscordCommand {
  return new DiscordCommand(props)
}

export const createCommand = createDiscordCommand
