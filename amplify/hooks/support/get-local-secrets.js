import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import dotenv from 'dotenv'
import { exists, getProjectInfo } from '../support.js'

export async function getLocalSecrets() {
  const projectInfo = await getProjectInfo()
  // const mainEnvFilePath = new URL('../../../.env', import.meta.url).pathname
  // const envSpecificEnvFilePath = new URL(
  //   `../../../.env.${projectInfo.envName}`,
  //   import.meta.url
  // ).pathname
  const mainEnvFilePath = path.resolve('.env')
  const envSpecificEnvFilePath = path.resolve(`.env.${projectInfo.envName}`)

  let localSecrets = {}
  if (
    !(await exists(mainEnvFilePath)) &&
    !(await exists(envSpecificEnvFilePath))
  ) {
    // we only want to warn and exit if there is no env files whatsoever, env-specific files overwrite globals, therefore global .env is not required
    console.info('No .env file(s) found, skipping secrets creation...')
    return localSecrets
  }

  if (await exists(mainEnvFilePath)) {
    localSecrets = dotenv.parse(await fs.readFile(mainEnvFilePath))
  }
  if (await exists(envSpecificEnvFilePath)) {
    localSecrets = {
      ...localSecrets,
      ...dotenv.parse(await fs.readFile(envSpecificEnvFilePath)),
    }
  }
  return localSecrets
}
