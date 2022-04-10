/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly E2E_DISCORD_APP_ID: string
  readonly E2E_DISCORD_PUBLIC_KEY: string
  readonly E2E_DISCORD_BOT_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
