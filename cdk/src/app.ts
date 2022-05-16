import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { HeyAmplifyStack } from './stack'
import { BotStack } from './stack-bot'
import { SvelteKitAppStack } from './stack-app'

const app = new cdk.App({
  context: {
    name: 'hey-amplify',
    env: 'default',
  },
})

const name = app.node.tryGetContext('name')
const env = app.node.tryGetContext('env')

const base = new HeyAmplifyStack(app, `${name}-${env}-stack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})

new BotStack(app, `${name}-${env}-bot-stack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  secrets: base.secrets,
  cluster: base.cluster,
  filesystem: base.filesystem,
})

// new SvelteKitAppStack(app, `${name}-${env}-sveltekit-stack`, {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   secrets: base.secrets,
//   cluster: base.cluster,
// })
