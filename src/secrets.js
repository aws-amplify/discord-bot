import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'

const isProduction = process.env.NODE_ENV === 'production'

export let secrets

function readFromLocal() {
  return {
    DISCORD_APP_ID: process.env.DISCORD_APP_ID,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
  }
}

async function readFromSSM() {
  const client = new SSMClient({ region: process.env.AWS_REGION })

  const Names = [
    process.env.DISCORD_APP_ID,
    process.env.DISCORD_TOKEN,
    process.env.DISCORD_PUBLIC_KEY,
  ]

  const command = new GetParametersCommand({ Names, WithDecryption: true })
  const params = await client.send(command)

  return params.Parameters?.reduce((acc, { Name, Value }) => {
    if (Name) acc[Name.split('/').pop()] = Value
    return acc
  }, {})
}

async function init() {
  if (isProduction) {
    // read from ParameterStore
    secrets = await readFromSSM()
  } else {
    secrets = readFromLocal()
  }

  if (secrets) {
    console.info('Successfully fetched secrets')
  }
}

export default init()
