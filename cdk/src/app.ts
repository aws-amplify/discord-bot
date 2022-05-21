import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { BaseStack } from './stack-base'

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
