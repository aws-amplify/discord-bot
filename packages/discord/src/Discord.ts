import { DiscordApi } from './api.js'

export interface IDiscord {
  //
}

export class Discord extends DiscordApi implements IDiscord {
  constructor(props: IDiscord) {
    super(props)
  }

  public async listGuilds() {
    const result = await this.get('/users/@me/guilds')
    return result
  }

  public async addRoleToUser({ guildId, userId, roleId }) {
    // https://discord.com/developers/docs/resources/guild#add-guild-member-role
    const result = await this.put(
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`
    )
    return result.status === 204
  }
}

export const discord = new Discord({})
