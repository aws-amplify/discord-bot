import {
  SSMClient,
  GetParametersByPathCommand,
  GetParameterCommand,
  PutParameterCommand,
} from '@aws-sdk/client-ssm'
import { loadEnv } from 'vite'
import type { PutParameterCommandInput } from '@aws-sdk/client-ssm'

const REGION = process.env.REGION || 'us-east-1'
const PROJECT_NAME = 'hey-amplify'
const PROJECT_ENV = 'local'
// TODO: interpolate environment name in place of 'env'
const PREFIX = `/app/${PROJECT_NAME}/${PROJECT_ENV}/secret/`

export interface CreateSSMParameterKeyPrefixProps {
  appName: string
  envName: string
}

export type SSMParameterKeyPrefixIsh = `/app/${string}/${string}`
export type SecretKeyPrefixIsh = `/app/${string}/${string}/secret`
export type SecretKeyIsh = `/app/${string}/${string}/secret/${string}`

export function createSSMParameterKeyPrefix(
  props: CreateSSMParameterKeyPrefixProps
): SSMParameterKeyPrefixIsh {
  return `/app/${props.appName}/${props.envName}`
}

export function createSecretKeyPrefix(
  props: CreateSSMParameterKeyPrefixProps
): SecretKeyPrefixIsh {
  return `${createSSMParameterKeyPrefix(props)}/secret`
}

export function createSecretKey(
  secretName: string,
  options: CreateSSMParameterKeyPrefixProps
): SecretKeyIsh {
  return `${createSecretKeyPrefix(options)}/${secretName}`
}

export function loadSecrets(
  envName = '_local',
  envDir: string = process.cwd(),
  envPrefix: string | string[] = ['DISCORD_', 'VITE_']
): Record<string, string> {
  let prefixes = envPrefix
  if (prefixes) {
    prefixes = Array.isArray(envPrefix)
      ? (envPrefix as string[])
      : [envPrefix as string]
  }
  return loadEnv(envName, envDir, prefixes)
}

export async function getSecretsByPrefix(prefix: SecretKeyPrefixIsh) {
  try {
    const client = new SSMClient({ region: REGION })
    const command = new GetParametersByPathCommand({
      Path: `${prefix}/`,
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

export async function getSecrets(
  appName: string = PROJECT_NAME,
  envName: string = PROJECT_ENV
) {
  const prefix = createSecretKeyPrefix({
    appName: appName,
    envName: envName,
  })
  const secrets = await getSecretsByPrefix(prefix)
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

interface CreateSecretsProps {
  appName: string
  envName: string
}

export async function createSecrets(props: CreateSecretsProps) {
  /**
   * @type {import('@aws-sdk/client-ssm').SSMClient}
   */
  const client = new SSMClient({ region: REGION })

  const secretsPrefix = createSecretKeyPrefix(props)
  const parameters: Parameters = {
    created: [],
    updated: [],
    unchanged: [],
  }

  // TODO: delete unused variables as they're removed from .env?
  const secrets = Object.entries(loadSecrets(props.envName))
  if (!secrets.length) process.exit(0)

  for (const [key, value] of secrets) {
    const Name = `${secretsPrefix}/${key}`
    const Tags = [
      { Key: 'app:name', Value: props.appName },
      { Key: 'app:env', Value: props.envName },
    ]

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

  return parameters
}
