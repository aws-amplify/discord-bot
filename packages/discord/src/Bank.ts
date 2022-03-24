import type { IDiscordCommand, DiscordCommand } from './Command.js'

export interface IDiscordCommandBank {
  //
}

export class DiscordCommandBank
  extends Map<string, IDiscordCommand>
  implements IDiscordCommandBank
{
  // TODO: validate command name
  // TODO: ensure duplicates are not added -- static commands do not get precedence
  constructor(commands: DiscordCommand[]) {
    super()
    return new Map(commands.map((command) => [command.config.name, command]))
  }
}

export function createDiscordCommandBank(
  commands: DiscordCommand[] | IDiscordCommand[] | any
): DiscordCommandBank {
  return new DiscordCommandBank(commands)
}
