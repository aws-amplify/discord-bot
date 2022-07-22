/// <reference types="vitest/importMeta" />
/// <reference types="vitest/globals" />
/// <reference types="cypress" />

interface ImportMetaEnv {
  VITE_HOST: string
  VITE_NEXTAUTH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
