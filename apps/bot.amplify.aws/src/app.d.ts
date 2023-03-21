/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />
import * as Auth from '@auth/core/types'

interface User extends Auth.User {
  id: string
  isAdmin: boolean
  isStaff: boolean
  isGuildOwner: boolean
}

interface AppSession extends Auth.Session {
  user?: User
  isGithubLinked?: boolean
}

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      session: AppSession
      // Guild ID of the guild the user is currently viewing
      guild: string
    }

    interface Platform {}

    interface Session extends AppSession {}

    interface Stuff {}
  }
}
