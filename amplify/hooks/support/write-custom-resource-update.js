import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import * as os from 'node:os'
import { getProjectInfo, exists, getSecretParameterPrefix } from '../support.js'

export async function generateFileHash() {
  const projectInfo = await getProjectInfo()
  const mainEnvFilePath = path.resolve('.env')
  const envSpecificEnvFilePath = path.resolve(`.env.${projectInfo.envName}`)
  const hashSum = crypto.createHash('sha256')

  if (await exists(mainEnvFilePath)) {
    hashSum.update(await fs.readFile(mainEnvFilePath))
  }
  if (await exists(envSpecificEnvFilePath)) {
    hashSum.update(await fs.readFile(envSpecificEnvFilePath))
  }

  const hex = hashSum.digest('hex')

  return hex
}

export async function writeCustomResourceUpdate() {
  const HEX = await generateFileHash()
  if (!HEX) return

  const cdkStack = path.resolve('amplify/backend/custom/secrets/cdk-stack.ts')
  if (!(await exists(cdkStack))) {
    console.warn('No cdk-stack.ts found')
    return
  }

  const cdkStackContent = await fs.readFile(cdkStack, 'utf8')
  const snapshotParameterName = `${await getSecretParameterPrefix()}/_snapshot`

  let changed = []
  for (let line of cdkStackContent.split(os.EOL)) {
    if (line.startsWith('const HEX')) {
      line = `const HEX = '${HEX}'`
      changed.push(line)
      continue
    }
    if (line.startsWith('const SNAPSHOT_PARAMETER_NAME')) {
      line = `const SNAPSHOT_PARAMETER_NAME = '${snapshotParameterName}'`
      changed.push(line)
      continue
    }
    changed.push(line)
  }

  try {
    await fs.writeFile(cdkStack, changed.join(os.EOL), 'utf8')
  } catch (error) {
    throw new Error('Error writing to secrets/cdk-stack.ts', error)
  }
}
