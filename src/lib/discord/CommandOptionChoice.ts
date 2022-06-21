import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v9'

interface IDiscordCommandOptionChoiceOptions
  extends APIApplicationCommandOptionChoice {}

// class written in case we choose to extend option choice type from discord-api-types
export class DiscordCommandOptionChoice
  implements IDiscordCommandOptionChoiceOptions
{
  public readonly name: string
  public readonly value: string | number

  constructor(props: IDiscordCommandOptionChoiceOptions) {
    this.name = props.name
    this.value = props.value
  }
}

export function createDiscordCommandOptionChoice(
  props: IDiscordCommandOptionChoiceOptions
): DiscordCommandOptionChoice {
  return new DiscordCommandOptionChoice(props)
}

export const createChoice = createDiscordCommandOptionChoice
