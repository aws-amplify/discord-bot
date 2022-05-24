/// <reference types="@sveltejs/kit" />
// / <reference types="vite/client" />

interface ImportMetaEnv {
  DISCORD_APP_ID: string
  DISCORD_PUBLIC_KEY: string
  DISCORD_BOT_TOKEN: string
  DISCORD_REDIRECT_URI: string
  VITE_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly vitest: boolean
}
