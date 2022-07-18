import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthHandler } from 'next-auth/core'
import cookie from 'cookie'
import getFormBody from './support/get-form-body'
import { prisma } from '$lib/db'
import DiscordProvider from 'next-auth/providers/discord'
import GithubProvider from 'next-auth/providers/github'
import type {
  IncomingRequest,
  NextAuthOptions,
  NextAuthAction,
  Session,
} from 'next-auth'
import type { OutgoingResponse } from 'next-auth/core'
import { fetchGuild, fetchGuildUser } from './github/apply-roles'

// TODO: can we get around this behavior for SSR builds?
// @ts-expect-error
const discord = DiscordProvider?.default || DiscordProvider
// @ts-expect-error
const github = GithubProvider?.default || GithubProvider

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: import.meta.env.DEV,
  providers: [
    discord({
      clientId: process.env.DISCORD_AUTH_CLIENT_ID,
      clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  callbacks: {
    async redirect({ url }) {
      return url
    },

    // verify if session gets checked again after they sign in with github, if not do this in sign in
    async session({ session, user }) {
      if (!session || !user) return session

      const userAccounts = await prisma.account.findMany({
        where: { userId: user.id },
      })
      const storedUserGitHub =
        userAccounts.length === 2 &&
        userAccounts.filter((account) => account.provider === 'github')
          .length === 1
      const discUserId = userAccounts.filter(
        (account) => account.provider === 'discord'
      )[0].providerAccountId

      if (storedUserGitHub) session.user.github = true
      return session
    },
  },
}

async function toSvelteKitResponse(
  request: Request,
  nextAuthResponse: OutgoingResponse<unknown>
) {
  const { headers, cookies, body, redirect, status = 200 } = nextAuthResponse

  const response = {
    status,
    headers: {},
  }

  headers?.forEach((header) => {
    response.headers[header.key] = header.value
  })

  response.headers['set-cookie'] = cookies?.map((item) => {
    return cookie.serialize(item.name, item.value, item.options)
  })

  if (redirect) {
    let formData = null
    try {
      formData = await request.formData()
      formData = getFormBody(formData)
    } catch {
      // no formData passed
    }
    if (formData?.json !== 'true') {
      response.status = 302
      response.headers['Location'] = redirect
    } else {
      response['body'] = { url: redirect }
    }
  } else {
    response['body'] = body
  }

  return response
}

async function SKNextAuthHandler(
  // { request, url, params }: RequestEvent,
  { request, url, params },
  options: NextAuthOptions
) {
  const nextauth = params.nextauth.split('/')
  let body = null
  try {
    body = await request.formData()
    body = getFormBody(body)
  } catch {
    // no formData passed
  }
  options.secret = process.env.NEXTAUTH_SECRET
  const req: IncomingRequest = {
    host: import.meta.env.VITE_NEXTAUTH_URL,
    body,
    query: Object.fromEntries(url.searchParams),
    headers: request.headers,
    method: request.method,
    // this is causing issues if browser does not have cookies
    // cookies: cookie.parse(request.headers.get('cookie')),
    action: nextauth[0] as NextAuthAction,
    providerId: nextauth[1],
    error: nextauth[1],
  }

  const cookies = request.headers.get('cookie')
  if (cookies) req.cookies = cookie.parse(cookies)

  const response = await NextAuthHandler({
    req,
    options,
  })

  return toSvelteKitResponse(request, response)
}

export async function getServerSession(
  request: Request,
  options: NextAuthOptions
): Promise<Session | null> {
  options.secret = process.env.NEXTAUTH_SECRET

  const session = await NextAuthHandler<Session>({
    req: {
      host: import.meta.env.VITE_NEXTAUTH_URL,
      action: 'session',
      method: 'GET',
      cookies: cookie.parse(request.headers.get('cookie') || ''),
      headers: request.headers,
    },
    options,
  })

  const { body } = session

  if (body && Object.keys(body).length) return body as Session
  return null
}

export default (
  options: NextAuthOptions
): {
  get: (req) => Promise<unknown>
  post: (req) => Promise<unknown>
} => ({
  get: (req) => SKNextAuthHandler(req, options),
  post: (req) => SKNextAuthHandler(req, options),
})
