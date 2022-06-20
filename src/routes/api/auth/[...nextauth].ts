import { default as NextAuth, options } from '$lib/next-auth'

export const { get, post } = NextAuth(options)
