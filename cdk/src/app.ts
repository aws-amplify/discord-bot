#!/usr/bin/env node
import 'source-map-support/register.js'
import * as cdk from 'aws-cdk-lib'
import { BotStack } from './stack-bot'
import { AppStack } from './stack-app'

const app = new cdk.App()
new BotStack(app, 'BotStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
new AppStack(app, 'AppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
