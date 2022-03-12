export type AmplifyProject = {
  environment: {
    envName: string
    projectPath: string
    defaultEditor: string
  }
  command: string
  subCommand: string
  argv: string[]
}

export type HookData = {
  amplify: AmplifyProject
}

export type HookError = {
  message: string
  stack: string
}

export as namespace Hook
