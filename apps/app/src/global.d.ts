/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  VITE_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly vitest: boolean
}
