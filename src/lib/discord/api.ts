import { REST } from '@discordjs/rest'
import type {
  RESTOptions,
  InternalRequest,
  RequestMethod,
} from '@discordjs/rest'

// we'll want to eventually expand this interface with more options specific to our DX
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
    payload?: unknown
  ): Promise<unknown> {
    const options: InternalRequest = {
      method: method as RequestMethod,
      fullRoute: url as `/${string}`,
      headers: {
        'Content-Type': 'application/json',
      },
      passThroughBody: true,
    }
    if (payload) {
      options.body = JSON.stringify(payload || {})
    }
    return this.request(options)
  }

  public get(url: string): Promise<unknown> {
    return this._request('GET', url)
  }

  public post(url: string, payload?: unknown): Promise<unknown> {
    return this._request('POST', url, payload)
  }

  public put(url: string, payload?: unknown): Promise<unknown> {
    return this._request('PUT', url, payload)
  }

  public delete(url: string, payload?: unknown): Promise<unknown> {
    return this._request('DELETE', url, payload)
  }
}

export function createDiscordApi(
  token: string = process.env.DISCORD_BOT_TOKEN as string
): DiscordApi {
  return new DiscordApi({ token })
}

export const api = createDiscordApi()
