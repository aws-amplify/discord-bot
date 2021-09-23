const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm')

const SECRET_NAMES = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_APP_ID',
  'DISCORD_PUBLIC_KEY',
]

async function getSecrets(secretNames) {
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
    throw new Error('Unable to get secrets', error)
  }
}

async function loadSecrets() {
  console.log('Loading secrets')
  try {
    const secrets = await getSecrets(SECRET_NAMES)
    for (let [secretName, secretValue] of Object.entries(secrets)) {
      process.env[secretName] = secretValue
    }
    console.log('Secrets loaded successfully')
    return true
  } catch (error) {
    throw new Error('Unable to load secrets', error)
  }
}

exports.SECRET_NAMES = SECRET_NAMES
exports.loadSecrets = loadSecrets
exports.getSecrets = getSecrets
