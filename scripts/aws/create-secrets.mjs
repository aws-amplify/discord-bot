import { access, readFile } from 'fs/promises'
import { resolve } from 'path'
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm'
import dotenv from 'dotenv'

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function readJSON(path) {
  if (!exists(path)) throw new Error(`File ${path} does not exist`)
  const content = await readFile(path, 'utf8')
  return JSON.parse(content)
}

async function getProjectInfo() {
  const { envName } = await readJSON(
    resolve(process.cwd(), 'amplify/.config/local-env-info.json')
  )
  const teamProviderInfo = await readJSON(
    resolve(process.cwd(), 'amplify/team-provider-info.json')
  )
  const { projectName } = await readJSON(
    resolve(process.cwd(), 'amplify/.config/project-config.json')
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

// check existence of local secrets file
// secrets file will not exist in pipeline
const envFilePath = resolve(process.cwd(), '.env')
if (!(await exists(envFilePath))) {
  console.warn('No .env file found, skipping secrets creation...')
  process.exit(0)
}

/**
 * @type {import('@aws-sdk/client-ssm').SSMClient}
 */
const client = new SSMClient({ region: process.env.AWS_REGION })

// parse local secrets
let localSecrets = dotenv.config({ path: envFilePath })
if (localSecrets.error) {
  throw localSecrets.error
}
localSecrets = localSecrets.parsed

const projectInfo = await getProjectInfo()
const secretsPrefix = `/amplify/${projectInfo.projectName}/${projectInfo.envName}/secrets`
const parameters = []

for (let [key, value] of Object.entries(localSecrets)) {
  /**
   * @type {import('@aws-sdk/client-ssm').PutParameterCommandInput}
   */
  const putParameterInput = {
    Type: 'SecureString',
    Name: `${secretsPrefix}/${key}`,
    Value: value,
    Tags: [
      { Key: 'amplify-app-name', Value: projectInfo.projectName },
      { Key: 'amplify-app-id', Value: projectInfo.appId },
    ],
  }
  try {
    await client.send(new PutParameterCommand(putParameterInput))
    parameters.push(putParameterInput)
  } catch (error) {
    // swallow error if parameter exists
    if (error.name === 'ParameterAlreadyExists') {
      continue
    }
    console.error(error)
  }
}
