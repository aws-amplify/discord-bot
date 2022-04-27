/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DISCORD_APP_ID: string
  readonly DISCORD_PUBLIC_KEY: string
  readonly DISCORD_BOT_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
