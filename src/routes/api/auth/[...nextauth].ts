import { default as NextAuth, options } from '$lib/next-auth'

export const { GET, POST } = NextAuth(options)
