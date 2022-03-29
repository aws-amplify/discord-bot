import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function readJSON(path) {
  if (!exists(path)) throw new Error(`File ${path} does not exist`)
  const content = await readFile(path, 'utf8')
  return JSON.parse(content)
}

export async function getProjectInfo() {
  const { envName } = await readJSON(
    resolve(new URL('../.config/local-env-info.json', import.meta.url).pathname)
  )
  const teamProviderInfo = await readJSON(
    resolve(new URL('../team-provider-info.json', import.meta.url).pathname)
  )
  const { projectName } = await readJSON(
    resolve(new URL('../.config/project-config.json', import.meta.url).pathname)
  )
  const appId = teamProviderInfo[envName].awscloudformation.AmplifyAppId
  const region = teamProviderInfo[envName].awscloudformation.Region
  return {
    projectName,
    envName,
    appId,
    region,
  }
}

export async function getParameterPrefix() {
  const projectInfo = await getProjectInfo()
  return `/amplify/${projectInfo.projectName}/${projectInfo.envName}`
}

export async function getSecretParameterPrefix() {
  return `${await getParameterPrefix()}/secret`
}
