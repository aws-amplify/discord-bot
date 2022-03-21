import fetch from 'node-fetch'
import type { RequestInit } from 'node-fetch'

type DiscordAPIRequestResponse = {
  data: { [key: string]: any }
  error: { name: string; message: string }
  status: number
}

type DiscordAPIRequestPayload = {
  [prop: string]: any
}

export interface IDiscordAPI {
  token?: string
}

export class DiscordAPI implements IDiscordAPI {
  private readonly baseURL = 'https://discordapp.com/api/v8'
  readonly token = process.env.DISCORD_TOKEN
  private options: RequestInit = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${this.token}`,
      'Content-Type': 'application/json',
    },
  }

  constructor(props: IDiscordAPI) {
    this.token = props.token
  }

  private request = async (
    url: string,
    payload?: DiscordAPIRequestPayload
  ): Promise<DiscordAPIRequestResponse> => {
    if (payload) this.options.body = JSON.stringify(payload)
    const fetchUrl = new URL(url, this.baseURL)
    const response = await fetch(fetchUrl.href, this.options)

    let data
    let error
    let status = response.status

    if (response.ok) {
      data = await response.json()
    } else {
      error = await response.json()
    }

    // cleanup, is this needed? is there a better way to handle fetch options?
    // ... should we just create options every time?
    delete this.options.body

    return { data, error, status }
  }

  public get = async (url: string): Promise<DiscordAPIRequestResponse> => {
    this.options.method = 'GET'
    return this.request(url)
  }

  public post = async (
    url: string,
    payload?: DiscordAPIRequestPayload
  ): Promise<DiscordAPIRequestResponse> => {
    this.options.method = 'POST'
    return this.request(url, payload)
  }

  public put = async (
    url: string,
    payload?: DiscordAPIRequestPayload
  ): Promise<DiscordAPIRequestResponse> => {
    this.options.method = 'PUT'
    return this.request(url, payload)
  }

  public delete = async (
    url: string,
    payload?: DiscordAPIRequestPayload
  ): Promise<DiscordAPIRequestResponse> => {
    this.options.method = 'DELETE'
    return this.request(url, payload)
  }
}

export function createAPI(
  token: string = process.env.DISCORD_BOT_TOKEN as string
): DiscordAPI {
  return new DiscordAPI({ token })
}
