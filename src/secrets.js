import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'

const client = new SSMClient({ region: process.env.AWS_REGION })

export let secrets

async function init() {
  const Names = [
    process.env.DISCORD_APP_ID,
    process.env.DISCORD_TOKEN,
    process.env.DISCORD_PUBLIC_KEY,
  ]

  const command = new GetParametersCommand({ Names, WithDecryption: true })
  const params = await client.send(command)

  secrets = params.Parameters?.reduce((acc, { Name, Value }) => {
    if (Name) acc[Name.split('/').pop()] = Value
    return acc
  }, {})

  if (secrets) {
    console.info('Successfully fetched secrets')
  }
}

export default init()
