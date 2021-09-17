const { SSMClient, GetParametersCommand } = require('@aws-sdk/client-ssm')

const SECRET_NAMES = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_APP_ID',
  'DISCORD_PUBLIC_KEY',
]
async function getSecrets(secretNames) {
  const client = new SSMClient({ region: process.env.AWS_REGION })
  const Names = secretNames.map((secretName) => process.env[secretName])
  const command = new GetParametersCommand({ Names, WithDecryption: true })
  const params = await client.send(command)

  return params.Parameters?.reduce((acc, { Name, Value }, index) => {
    if (Name)
      acc[secretNames.find((secretName) => Name.endsWith(secretName))] = Value
    return acc
  }, {})
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
    throw new Error('Unable to fetch secrets', error)
  }
}

exports.SECRET_NAMES = SECRET_NAMES
exports.loadSecrets = loadSecrets
exports.getSecrets = getSecrets
