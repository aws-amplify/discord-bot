export interface IDiscordCommandConfig {
  name: string
  description?: string
  usage?: string
  // options?: IDiscordCommandOption[]
}

export interface IDiscordCommandContext {
  //
}

export interface IDiscordCommand {
  config: IDiscordCommandConfig
  handler: (context: IDiscordCommandContext) => Promise<string | undefined>
}

export type DiscordCommandContext = IDiscordCommandContext
export type DiscordCommandConfig = IDiscordCommandConfig

export class DiscordCommand implements IDiscordCommand {
  public readonly config: IDiscordCommandConfig
  public readonly handler: (
    context: IDiscordCommandContext
  ) => Promise<string | undefined>

  constructor(props) {
    this.config = props.config
    this.handler = props.handler
  }
}

export function createDiscordCommand(
  props: IDiscordCommandConfig
): IDiscordCommand {
  return new DiscordCommand(props)
}

export const createCommand = createDiscordCommand
