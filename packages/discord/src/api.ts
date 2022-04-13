import { REST } from '@discordjs/rest'
import type {
  RESTOptions,
  InternalRequest,
  RequestMethod,
} from '@discordjs/rest'

export interface IDiscordApi extends REST {}

export interface IDiscordApiProps extends Partial<RESTOptions> {
  token: string
}

export class DiscordApi extends REST implements IDiscordApi {
  constructor(props: IDiscordApiProps) {
    super({ version: '10' })
    this.setToken(props.token)
  }

  private async _request(
    method: `${RequestMethod}`,
    url: string,
    payload?: any
  ): Promise<any> {
    const options: InternalRequest = {
      method: method as RequestMethod,
      fullRoute: url as `/${string}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    if (payload) {
      options.body = JSON.stringify(payload)
    }
    return this.request(options)
  }

  public get(url: string): Promise<any> {
    return this._request('get', url)
  }

  public post(url: string, payload?: any): Promise<any> {
    return this._request('post', url, payload)
  }

  public put(url: string, payload?: any): Promise<any> {
    return this._request('put', url, payload)
  }

  public delete(url: string, payload?: any): Promise<any> {
    return this._request('delete', url, payload)
  }
}

export function createDiscordApi(
  token: string = process.env.DISCORD_BOT_TOKEN as string
): DiscordApi {
  return new DiscordApi({ token })
}
