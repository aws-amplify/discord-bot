import fetch from 'node-fetch'
import type { RequestInit } from 'node-fetch'

export type DiscordAPIRequestResponse = {
  data: { [key: string]: any }
  error: { name: string; message: string }
  status: number
}

type DiscordAPIRequestPayload = {
  [prop: string]: any
}

export interface IDiscordAPI {
  // token?: string
}

export interface IDiscordAPIProps {
  token?: string
}

export class DiscordApi implements IDiscordAPI {
  private readonly baseURL = new URL('/api/v8', 'https://discordapp.com')
  private token = process.env.DISCORD_BOT_TOKEN
  private options: any = {
    method: 'GET',
    headers: {
      Authorization: `Bot ${this.token}`,
      'Content-Type': 'application/json',
    },
  }

  constructor(props: IDiscordAPIProps) {
    if (props.token) {
      this.token = props.token
    }
  }

  private request = async (
    url: string,
    payload?: DiscordAPIRequestPayload
  ): Promise<DiscordAPIRequestResponse> => {
    // patch for requesting with token when token env var not initially available
    if (!this.token && process.env.DISCORD_BOT_TOKEN) {
      this.token = process.env.DISCORD_BOT_TOKEN
      this.options.headers.Authorization = `Bot ${this.token}`
    }
    if (payload) this.options.body = JSON.stringify(payload)
    const apiPath = `${this.baseURL.pathname}${url}`
    const fetchUrl = new URL(apiPath, this.baseURL)
    const response = await fetch(fetchUrl.href, this.options)

    let data
    let error
    const status = response.status

    if (response.ok) {
      try {
        data = await response.json()
      } catch (error) {
        // not valid json body
      }
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

export function createDiscordApi(
  token: string = process.env.DISCORD_BOT_TOKEN as string
): DiscordApi {
  return new DiscordApi({ token })
}

export const createApi = createDiscordApi
export const api = createDiscordApi()
