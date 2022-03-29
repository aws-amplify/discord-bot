/// <reference path="./index.d.ts" />
import {
  SSMClient,
  PutParameterCommand,
  GetParameterCommand,
} from '@aws-sdk/client-ssm'
import { getProjectInfo, getSecretParameterPrefix } from './support.js'
import { getLocalSecrets } from './support/get-local-secrets.js'
import { writeCustomResourceUpdate } from './support/write-custom-resource-update.js'

/**
 * @param {Hook.HookData} data
 * @param {Hook.HookError} error
 */
async function hookHandler(data, error) {
  const projectInfo = await getProjectInfo()
  // check existence of local secrets file
  // secrets file will not exist in pipeline
  const localSecrets = await getLocalSecrets()

  /**
   * @type {import('@aws-sdk/client-ssm').SSMClient}
   */
  const client = new SSMClient({ region: projectInfo.region })

  const secretsPrefix = await getSecretParameterPrefix()
  const parameters = {
    created: [],
    updated: [],
    unchanged: [],
  }

  // TODO: delete unused variables as they're removed from .env?
  const secrets = Object.entries(localSecrets)
  if (!secrets.length) process.exit(0)
  for (let [key, value] of secrets) {
    const Name = `${secretsPrefix}/${key}`
    const Tags = [
      { Key: 'amplify-app-name', Value: projectInfo.projectName },
      { Key: 'amplify-app-id', Value: projectInfo.appId },
    ]
    /**
     * @type {import('@aws-sdk/client-ssm').PutParameterCommandInput}
     */
    const putParameterInput = {
      Type: 'SecureString',
      Name,
      Value: value,
    }

    let existing
    try {
      existing = await client.send(
        new GetParameterCommand({ Name, WithDecryption: true })
      )
    } catch (error) {
      // ignore
    }
    if (existing) {
      // update
      if (existing.Parameter.Value !== value) {
        putParameterInput.Overwrite = true
        try {
          await client.send(new PutParameterCommand(putParameterInput))
          parameters.updated.push(key)
        } catch (error) {
          console.error(error)
        }
      } else {
        parameters.unchanged.push(key)
      }
      // TODO: update/add tags
    } else {
      // create
      putParameterInput.Tags = Tags
      try {
        await client.send(new PutParameterCommand(putParameterInput))
        parameters.created.push(key)
      } catch (error) {
        // swallow error if parameter exists
        // if (error.name === 'ParameterAlreadyExists') {
        //   continue
        // }
        console.error(error)
      }
    }
  }

  // TODO: make this pretty
  let message = 'Secrets Summary:\n'
  if (parameters.created.length) {
    message += `\tCreated:\n\t\t- ${parameters.created.join('\n\t\t- ')}\n`
  }
  if (parameters.updated.length) {
    message += `\tUpdated:\n\t\t- ${parameters.updated.join('\n\t\t- ')}\n`
  }
  if (parameters.unchanged.length) {
    message += `\tUnchanged:\n\t\t- ${parameters.unchanged.join('\n\t\t- ')}\n`
  }

  console.info(message)
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

// TODO: trigger custom resource update by writing HEX to cdk-stack.ts?
// TODO: then in post-push, remove HEX
try {
  await writeCustomResourceUpdate()
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
