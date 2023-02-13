/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly VITE_HOST: string
      readonly VITE_DISCORD_DISCORD_ID: string
      /**
       * The URL of the database.
       */
      readonly DATABASE_URL: string
    }
  }
}

export {}
