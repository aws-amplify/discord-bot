import * as path from 'node:path'
import {
  LambdaClient,
  GetFunctionCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda'
import glob from 'fast-glob'
import { getProjectInfo } from '../support.js'

/**
 *
 * @param {Object.<string, string>} envVars
 */
export async function addEnvVarsToFunctions(envVars) {
  const projectInfo = await getProjectInfo()
  const client = new LambdaClient({ region: projectInfo.region })

  const functionNames = (
    await glob(new URL('../../backend/function/*', import.meta.url).pathname, {
      onlyDirectories: true,
    })
  ).map(
    (functionPath) => `${path.basename(functionPath)}-${projectInfo.envName}`
  )

  for (let functionName of functionNames) {
    /**
     * @type {import('@aws-sdk/client-lambda').GetFunctionCommandInput}
     */
    const getFunctionCommandInput = {
      FunctionName: functionName,
    }
    const command = new GetFunctionCommand(getFunctionCommandInput)
    let existing
    try {
      existing = await client.send(command)
    } catch (error) {
      // swallow error and do not proceed if function does not exist
      if (error.name === 'ResourceNotFoundException') {
        break
      }
      console.warn(error)
    }
    if (existing) {
      /** @type {import('@aws-sdk/client-lambda').UpdateFunctionConfigurationCommandInput} */
      const updateConfigurationCommandInput = existing.Configuration
      updateConfigurationCommandInput.Environment.Variables = {
        ...updateConfigurationCommandInput.Environment.Variables,
        ...envVars,
      }
      const updateCommand = new UpdateFunctionConfigurationCommand(
        updateConfigurationCommandInput
      )
      try {
        await client.send(updateCommand)
        console.info(`Updated function configuration for ${functionName}`)
      } catch (error) {
        console.warn(error)
      }
    }
  }
}
