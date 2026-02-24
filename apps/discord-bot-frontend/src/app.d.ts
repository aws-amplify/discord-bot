/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />
import type { APIGuild } from 'discord.js'
import type * as Auth from '@auth/core/types'

interface User extends Auth.User {
  id: string
  discordUserId: string
  isAdmin: boolean
  isStaff: boolean
  isGuildOwner: boolean
  isGithubLinked?: boolean
}

interface AppSession extends Auth.Session {
  user?: User
}

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      auth: () => Promise<AppSession | null>
      session?: AppSession
      // Guild ID of the guild the user is currently viewing
      guildId: string
      // Guilds that are shared between the current user and bot
      guilds: APIGuild[]
    }

    interface Platform {}

    interface Session extends AppSession {}

    interface Stuff {}
  }
}

export type { User, AppSession }
