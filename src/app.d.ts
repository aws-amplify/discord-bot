/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />
import type * as NextAuth from 'next-auth'

interface User extends NextAuth.User {
  id: string
  isAdmin: boolean
  isStaff: boolean
}

interface AppSession extends NextAuth.Session {
  user: User
  // Guild ID of the guild the user is currently viewing
  guild: string
}

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      session: AppSession
    }

    interface Platform {}

    interface Session extends AppSession {}

    interface Stuff {}
  }
}
