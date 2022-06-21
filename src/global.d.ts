/// <reference types="@sveltejs/kit" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  DISCORD_APP_ID: string
  DISCORD_REDIRECT_URI: string
  VITE_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly vitest?: typeof import('vitest')
}
