import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { HeyAmplifyStack } from './stack'

const app = new cdk.App({
  context: {
    name: 'hey-amplify',
    env: 'default',
  },
})

const name = app.node.tryGetContext('name')
const env = app.node.tryGetContext('env')

new HeyAmplifyStack(app, `${name}-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
