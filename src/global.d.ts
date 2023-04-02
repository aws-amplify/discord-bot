/// <reference types="vitest/importMeta" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  VITE_HOST: string
  VITE_NEXTAUTH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type ValueOf<T> = T[keyof T]
