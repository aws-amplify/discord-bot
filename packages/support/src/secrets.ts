import {
  SSMClient,
  GetParametersByPathCommand,
  GetParameterCommand,
  PutParameterCommand,
} from '@aws-sdk/client-ssm'
import { loadEnv } from 'vite'
import type { PutParameterCommandInput } from '@aws-sdk/client-ssm'

const PROJECT_NAME = 'hey-amplify'
// TODO: interpolate environment name in place of 'env'
const PREFIX = `/app/hey-amplify/env/secret/`
const REGION = process.env.REGION || 'us-east-1'

export function loadSecrets(
  envDir: string = new URL('../../', import.meta.url).pathname,
  envPrefix: string | string[] = 'DISCORD_'
): Record<string, string> {
  const prefixes = Array.isArray(envPrefix) ? envPrefix : [envPrefix]
  return loadEnv('development', envDir, prefixes)
}

export async function getSecretsFromSSM() {
  try {
    const client = new SSMClient({ region: REGION })
    const command = new GetParametersByPathCommand({
      Path: PREFIX,
      WithDecryption: true,
    })
    const { Parameters } = await client.send(command)

    if (!Parameters?.length) {
      throw new Error('No secrets found')
    }

    return Parameters
  } catch (error) {
    console.error(error)
    throw new Error(`Unable to get secrets: ${(error as Error).message}`)
  }
}

export async function getSecrets() {
  const secrets = await getSecretsFromSSM()
  const result = {}

  for (const secret of secrets) {
    const key = secret?.Name?.replace(PREFIX, '')
    if (key) result[key] = secret.Value
  }

  return result
}

interface Parameters {
  created: string[]
  updated: string[]
  unchanged: string[]
}

export async function createSecrets() {
  /**
   * @type {import('@aws-sdk/client-ssm').SSMClient}
   */
  const client = new SSMClient({ region: REGION })

  const secretsPrefix = PREFIX
  const parameters: Parameters = {
    created: [],
    updated: [],
    unchanged: [],
  }

  // TODO: delete unused variables as they're removed from .env?
  const secrets = Object.entries(loadSecrets())
  if (!secrets.length) process.exit(0)
  for (const [key, value] of secrets) {
    const Name = `${secretsPrefix}/${key}`
    const Tags = [{ Key: 'app-name', Value: PROJECT_NAME }]

    const putParameterInput: PutParameterCommandInput = {
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
}
