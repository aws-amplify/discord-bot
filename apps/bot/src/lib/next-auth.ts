import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthHandler } from 'next-auth/core'
import cookie from 'cookie'
import getFormBody from './support/get-form-body'
import { prisma } from '$lib/db'
import DiscordProvider from 'next-auth/providers/discord'
import GithubProvider from 'next-auth/providers/github'
import type { RequestHandler } from '@sveltejs/kit'
import type { IncomingRequest, NextAuthOptions, Session } from 'next-auth'
import type { NextAuthAction } from 'next-auth/lib/types'
import type { OutgoingResponse } from 'next-auth/core'

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_AUTH_CLIENT_ID,
      clientSecret: process.env.DISCORD_AUTH_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/',
    // signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  // callbacks: {
  //   async signIn({ user, account, profile, email, credentials }) {
  //     return true
  //   },
  //   async redirect({ url, baseUrl }) {
  //     return baseUrl
  //   },
  //   async session({ session, token, user }) {
  //     return session
  //   },
  //   async jwt({ token, user, account, profile, isNewUser }) {
  //     return token
  //   },
  // },
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

  headers?.forEach(header => {
    response.headers[header.key] = header.value
  })

  response.headers['set-cookie'] = cookies?.map(item => {
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
  options.secret = import.meta.env.VITE_NEXTAUTH_SECRET
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
  options.secret = import.meta.env.VITE_NEXTAUTH_SECRET

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
  get: req => SKNextAuthHandler(req, options),
  post: req => SKNextAuthHandler(req, options),
})
