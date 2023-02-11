declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_APP_ID: string
      GITHUB_TOKEN: string
      GITHUB_ORG_LOGIN: string
      GITHUB_PRIVATE_KEY: string
    }
  }
}

export {}
