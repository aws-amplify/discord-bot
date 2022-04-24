import c from 'picocolors'
import generateUsage from 'command-line-usage'
import { createSecrets } from '@hey-amplify/support'

export const name = 'create-secrets'
export const description = 'Create secrets in SSM from local dotenv files'

export const options = [
  { name: 'help', alias: 'h', type: Boolean },
  {
    name: 'appName',
    alias: 'n',
    type: String,
    defaultValue: 'hey-amplify',
  },
  { name: 'envName', alias: 'e', type: String },
  // { name: 'dry-run', alias: 'd', type: Boolean },
]

export const usage = generateUsage([
  {
    header: 'create-secrets',
    content: 'Creates secrets in SSM Parameter Store',
  },
  {
    header: 'Options',
    optionList: options,
  },
])

export async function handler(args) {
  if (args.help) {
    console.log(usage)
    return
  }

  if (!args.envName) {
    console.error(c.red('ERROR: envName is required'))
    console.log(usage)
    return
  }

  console.log(c.blue('Creating secrets...'))
  let parameters
  try {
    parameters = await createSecrets({
      appName: args.appName,
      envName: args.envName,
    })
  } catch (error) {
    throw new Error('Failed to create secrets: ' + error.message)
  }
  console.log(c.green('Success!'))
  if (parameters) {
    console.log(JSON.stringify(parameters, null, 2))
  }
}
