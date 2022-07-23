/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />
import type * as NextAuth from 'next-auth'

interface User extends NextAuth.User {
  id: string
  isAdmin: boolean
  isStaff: boolean
}

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {}

    interface Platform {}

    interface Session extends NextAuth.Session {
      user: User
    }

    interface Stuff {}
  }
}
