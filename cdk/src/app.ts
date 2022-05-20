import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { BaseStack } from './stack-base'
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

const base = new BaseStack(app, `${name}-base-stack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})

new BotStack(app, `${name}-bot-stack-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  secrets: base.secrets,
  cluster: base.cluster,
  filesystem: base.filesystem,
})

// new HeyAmplifySvelteKitAppStack(app, `${name}-${env}-sveltekit-stack`, {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
//   secrets: base.secrets,
//   cluster: base.cluster,
// })
