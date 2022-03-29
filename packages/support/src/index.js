import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'

export const SECRET_NAMES = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_APP_ID',
  'DISCORD_PUBLIC_KEY',
]

export async function getSecrets(secretNames) {
  try {
    const client = new SSMClient({ region: process.env.AWS_REGION })
    const Names = secretNames.map((secretName) => process.env[secretName])
    const command = new GetParametersCommand({ Names, WithDecryption: true })
    const params = await client.send(command)

    if (!params.Parameters.length || params.InvalidParameters.length) {
      throw new Error('Unable to retrieve secrets from ParameterStore')
    }

    return params.Parameters?.reduce((acc, { Name, Value }, index) => {
      if (Name)
        acc[secretNames.find((secretName) => Name.endsWith(secretName))] = Value
      return acc
    }, {})
  } catch (error) {
    console.error(error)
    throw new Error('Unable to get secrets', error)
  }
}

export async function loadSecrets(secretNames = SECRET_NAMES) {
  console.log('Loading secrets')
  try {
    const secrets = await getSecrets(secretNames)
    for (let [secretName, secretValue] of Object.entries(secrets)) {
      process.env[secretName] = secretValue
    }
    console.log('Secrets loaded successfully')
    return true
  } catch (error) {
    console.error(error)
    throw new Error('Unable to load secrets', error)
  }
}
