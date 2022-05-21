import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { RootStack } from './root-stack'

const app = new cdk.App({
  context: {
    name: 'heyamplify',
    env: 'default',
  },
})

const name = app.node.tryGetContext('name')
const env = app.node.tryGetContext('env')

new RootStack(app, `${name}-${env}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
