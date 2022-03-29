/// <reference path="./index.d.ts" />
import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm'
import { getProjectInfo, getSecretParameterPrefix } from './support.js'
import { addEnvVarsToFunctions } from './support/add-env-vars-to-functions.js'

const projectInfo = await getProjectInfo()

async function getSecrets() {
  try {
    const client = new SSMClient({ region: projectInfo.region })
    const command = new GetParametersByPathCommand({
      Path: await getSecretParameterPrefix(),
      WithDecryption: true,
    })
    const { Parameters } = await client.send(command)

    if (!Parameters.length) {
      throw new Error('No secrets found')
    }

    return Parameters
  } catch (error) {
    console.error(error)
    throw new Error('Unable to get secrets', error)
  }
}

/**
 * @param {Hook.HookData} data
 * @param {Hook.HookError} error
 */
async function hookHandler(data, error) {
  const secretsPrefix = await getSecretParameterPrefix()
  const secrets = (await getSecrets()).reduce(
    (acc, parameter) => ({
      ...acc,
      [parameter.Name.replace(`${secretsPrefix}/`, '')]: parameter.Value,
    }),
    {}
  )
  // cannot ignore by name, only match if beginswith or equals; manually delete snapshot env var
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ssm/modules/parameterstringfilter.html#option
  delete secrets._snapshot
  await addEnvVarsToFunctions(secrets)
}

const getParameters = async () => {
  // return JSON.parse(await fs.readFile(0, { encoding: 'utf8' }))
  return {}
}

const event = await getParameters()
try {
  await hookHandler(event.data, event.error)
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
